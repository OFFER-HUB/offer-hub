import { Router } from 'express';
import { MessageController } from '@/controllers/message.controller';
import { verifyToken } from '@/middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, MessageController.sendMessage);

router.get(
  '/conversation/:conversationId',
  verifyToken,
  MessageController.getMessagesByConversationId
);

router.get('/:messageId', verifyToken, MessageController.getMessageById);

router.put(
  '/:conversationId/mark-read',
  verifyToken,
  MessageController.markMessagesAsRead
);

export default router;
