'use strict'

const { exec } = require('child_process')
const GitHubClient = require('./github-client');

async function routes(fastify, options) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('GITHUB_TOKEN environment variable is required');
    }
    const githubClient = new GitHubClient(token);

    // Get staging environments
    fastify.get('/environments', async (request, reply) => {
        const environments = process.env.STAGING_ENVIRONMENTS || 'staging-1,staging-2,staging-3,staging-4,staging-5,staging-6,staging-7,staging-8,staging-9,staging-10,staging-11,staging-12,staging-13,staging-14,ubt';
        return { environments: environments.split(',') };
    });

    // Get all branches
    fastify.get('/branches', async (request, reply) => {
        const { owner, repo } = request.query;
        try {
            const branches = await githubClient.getBranches(owner, repo);
            return { branches };
        } catch (error) {
            reply.code(500);
            return { error: error.message };
        }
    });

    // Get detailed information about a specific branch
    fastify.get('/branches/:branch', async (request, reply) => {
        const { owner, repo } = request.query;
        const { branch } = request.params;
        try {
            const branchDetails = await githubClient.getBranchDetails(owner, repo, branch);
            return branchDetails;
        } catch (error) {
            reply.code(500);
            return { error: error.message };
        }
    });

    // Get branch protection rules
    fastify.get('/branches/:branch/protection', async (request, reply) => {
        const { owner, repo } = request.query;
        const { branch } = request.params;
        try {
            const protection = await githubClient.getBranchProtection(owner, repo, branch);
            return protection;
        } catch (error) {
            reply.code(500);
            return { error: error.message };
        }
    });

    // Get commit history for a branch
    fastify.get('/branches/:branch/commits', async (request, reply) => {
        const { owner, repo } = request.query;
        const { branch } = request.params;
        const { per_page = 10 } = request.query;
        try {
            const commits = await githubClient.getCommitHistory(owner, repo, branch, per_page);
            return { commits };
        } catch (error) {
            reply.code(500);
            return { error: error.message };
        }
    });

    // Get all forks
    fastify.get('/forks', async (request, reply) => {
        const { owner, repo } = request.query;
        try {
            const forks = await githubClient.getForks(owner, repo);
            return { forks };
        } catch (error) {
            reply.code(500);
            return { error: error.message };
        }
    });

    // Get repository information
    fastify.get('/repo', async (request, reply) => {
        const { owner, repo } = request.query;
        try {
            const repoInfo = await githubClient.getRepositoryInfo(owner, repo);
            return repoInfo;
        } catch (error) {
            reply.code(500);
            return { error: error.message };
        }
    });

    // Mukuru-specific endpoints
    fastify.get('/mukuru/repos', async (request, reply) => {
        try {
            const repos = await githubClient.getMukuruOrganizationRepos();
            return { repos };
        } catch (error) {
            reply.code(500);
            return { error: error.message };
        }
    });

    fastify.get('/mukuru/fork-status', async (request, reply) => {
        const { owner, repo } = request.query;
        try {
            const forkStatus = await githubClient.getForkStatus(owner, repo);
            return forkStatus;
        } catch (error) {
            reply.code(500);
            return { error: error.message };
        }
    });

    fastify.get('/mukuru/compare', async (request, reply) => {
        const { owner, repo, branch = 'main' } = request.query;
        try {
            const comparison = await githubClient.compareWithUpstream(owner, repo, branch);
            return comparison;
        } catch (error) {
            reply.code(500);
            return { error: error.message };
        }
    });
}

module.exports = routes;
