use soroban_sdk::{Address, Env};
use crate::Error;

/// Verify that the provided address is authorized to perform the operation
pub fn check_auth(_env: &Env, address: &Address) -> Result<(), Error> {
    address.require_auth();
    Ok(())
}

/// Validate that the score is within the acceptable range (1-5)
pub fn validate_score(score: i32) -> Result<(), Error> {
    if score < 1 || score > 5 {
        return Err(Error::InvalidScore);
    }
    Ok(())
}

/// Validate that a job is completed
/// This would typically call a job contract to verify completion status.
/// For now, it's a placeholder that would be replaced with actual validation logic.
pub fn validate_job_completion(_env: &Env, _job_id: &u32) -> Result<(), Error> {
    // In a real implementation, this would call the job contract to verify
    // that the job with job_id is completed.
    // For now, we'll assume all jobs are valid for testing purposes
    
    // Example of how this might look:
    // let job_contract_id = env.storage().get_unchecked(&storage::JOB_CONTRACT_ID);
    // let job_client = JobContractClient::new(env, job_contract_id);
    // let job_status = job_client.get_job_status(job_id);
    // if job_status != JobStatus::Completed {
    //     return Err(Error::JobNotCompleted);
    // }
    Ok(())
}

/// Validate that both users are participants in the job
/// This would typically call a job contract to verify that both the rater and
/// the target are participants in the specified job.
pub fn validate_job_participants(_env: &Env, _rater: &Address, _target: &Address, _job_id: &u32) -> Result<(), Error> {
    // In a real implementation, this would call the job contract to verify
    // that both rater and target are participants in the job.
    // For now, we'll assume all participants are valid for testing purposes
    
    // Example of how this might look:
    // let job_contract_id = env.storage().get_unchecked(&storage::JOB_CONTRACT_ID);
    // let job_client = JobContractClient::new(env, job_contract_id);
    // if !job_client.is_participant(rater, job_id) || !job_client.is_participant(target, job_id) {
    //     return Err(Error::NotJobParticipant);
    // }
    Ok(())
}
