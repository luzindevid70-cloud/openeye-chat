import { Router, Response } from 'express'; import { authMiddleware, AuthRequest } from '../middleware/auth'; import { checkLimit } from '../middleware/rateLimit'; import { streamAIResponse } from '../services/aiProxy'; import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); const router = Router();
router.post('/send', authMiddleware, checkLimit, async (req: AuthRequest, res: Response) => {
  const { chatId, message } = req.body; const userId = req.userId!;
  await prisma.message.create({ data: { role: 'user', content: message, chatId } });
  if (req.userRole !== 'premium') await prisma.user.update({ where: { id: userId }, data: { dailyMsgs: { increment: 1 } } });
  const history = await prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: 'asc' }, select: { role: true, content: true } });
  res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive');
  let fullAnswer = ''; const assistantMsg = await prisma.message.create({ data: { role: 'assistant', content: '', chatId } });
  await streamAIResponse(history.map(m => ({ role: m.role, content: m.content })), req.userRole,
    (chunk) => { fullAnswer += chunk; res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`); },
    async () => { await prisma.message.update({ where: { id: assistantMsg.id }, data: { content: fullAnswer } }); res.write('data: [DONE]\n\n'); res.end(); },
    (err) => { console.error(err); res.write(`data: ${JSON.stringify({ error: 'Ошибка генерации' })}\n\n`); res.end(); }
  );
});
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => { const chats = await prisma.chat.findMany({ where: { userId: req.userId }, orderBy: { updatedAt: 'desc' }, select: { id: true, title: true, updatedAt: true } }); res.json(chats); });
router.get('/messages/:chatId', authMiddleware, async (req: AuthRequest, res: Response) => { const messages = await prisma.message.findMany({ where: { chatId: req.params.chatId }, orderBy: { createdAt: 'asc' } }); res.json(messages); });
router.post('/new', authMiddleware, async (req: AuthRequest, res: Response) => { const chat = await prisma.chat.create({ data: { userId: req.userId! } }); res.json(chat); });
export default router;
