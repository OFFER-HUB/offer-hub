import { useInitializeContract } from './useInitializeContract';

export const ExampleInitializeContract = () => {
  const { handleSubmit } = useInitializeContract();

  // Mock payload that matches InitializeContractPayload type
  const payload = {
    clientId: 'client-123',
    freelancerId: 'freelancer-456', 
    amount: 1500,
    description: 'Develop a website for my company',
    milestones: [
      {
        id: 'milestone-1',
        title: 'Brandbook Creation',
        description: 'Create the brandbook',
        amount: 200,
        dueDate: '2024-12-31',
        status: 'pending' as const,
      },
      {
        id: 'milestone-2', 
        title: 'Website Development',
        description: 'Build the website',
        amount: 1000,
        dueDate: '2024-12-31',
        status: 'pending' as const,
      },
      {
        id: 'milestone-3',
        title: 'Testing and Deployment', 
        description: 'Test and deploy',
        amount: 300,
        dueDate: '2024-12-31',
        status: 'pending' as const,
      },
    ],
  };

  return (
    <div>
      <h1>Example Initialize Contract</h1>

      {/*
       * Create a form...
       */}
      <button onClick={() => handleSubmit(payload)}>
        Initialize Contract between client and freelancer
      </button>
    </div>
  );
};
