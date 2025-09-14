import { Router } from 'express';
import { ConversationController } from '@/controllers/conversation.controller';
import { verifyToken } from '@/middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, ConversationController.createConversation);

router.get(
  '/user/:userId',
  verifyToken,
  ConversationController.getConversationsByUserId
);

router.get(
  '/:conversationId',
  verifyToken,
  ConversationController.getConversationById
);

export default router;
