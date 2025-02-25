import { Router, Request, Response } from 'express';
import { FreelancerSkillsService } from '@/services/freelancer-skills.service';

const router: Router = Router();
const service = new FreelancerSkillsService();

router.post('/', async (req: Request, res: Response) => {
  try {
    const skill = await service.create(req.body);
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create freelancer skill' });
  }
});

router.get('/', async (_, res: Response) => {
  try {
    const skills = await service.getAll();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch freelancer skills' });
  }
});

router.get('/:user_id/:skill_id', async (req: Request, res: Response) => {
  try {
    const skill = await service.getById(req.params.user_id, req.params.skill_id);
    skill ? res.status(200).json(skill) : res.status(404).json({ error: 'Skill not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch freelancer skill' });
  }
});

router.put('/:user_id/:skill_id', async (req: Request, res: Response) => {
  try {
    const skill = await service.update(req.params.user_id, req.params.skill_id, req.body);
    res.status(200).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update freelancer skill' });
  }
});

router.delete('/:user_id/:skill_id', async (req: Request, res: Response) => {
  try {
    await service.delete(req.params.user_id, req.params.skill_id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete freelancer skill' });
  }
});

export default router;