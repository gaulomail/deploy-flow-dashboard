const { Octokit } = require('@octokit/rest');

class GitHubClient {
    constructor(token) {
        if (!token) {
            throw new Error('GitHub token is required');
        }
        this.octokit = new Octokit({
            auth: token,
            log: {
                debug: () => {},
                info: () => {},
                warn: console.warn,
                error: console.error
            }
        });
        this.organization = 'mukuru';
        this.mainRepo = 'mukuru';
    }

    async getBranches(owner, repo) {
        try {
            console.log(`Fetching all branches for ${owner}/${repo} using pagination.`);
            // Use octokit.paginate to fetch all branches
            const allBranches = await this.octokit.paginate(this.octokit.repos.listBranches, {
                owner,
                repo,
                per_page: 100, // Request 100 items per page (GitHub API max)
            });
            return allBranches.map(branch => branch.name);
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw new Error(`Failed to fetch branches: ${error.message}`);
        }
    }

    async getBranchDetails(owner, repo, branch) {
        try {
            const { data: branchData } = await this.octokit.repos.getBranch({
                owner,
                repo,
                branch
            });
            return {
                name: branchData.name,
                commit: {
                    sha: branchData.commit.sha,
                    message: branchData.commit.commit.message,
                    author: branchData.commit.commit.author,
                    date: branchData.commit.commit.author.date
                },
                protected: branchData.protected
            };
        } catch (error) {
            throw new Error(`Failed to fetch branch details: ${error.message}`);
        }
    }

    async getForks(owner, repo) {
        try {
            const { data: forks } = await this.octokit.repos.listForks({
                owner,
                repo,
                per_page: 100
            });
            return forks.map(fork => ({
                owner: fork.owner.login,
                name: fork.name,
                url: fork.html_url,
                stars: fork.stargazers_count,
                forks: fork.forks_count,
                lastUpdated: fork.updated_at,
                isMukuruFork: fork.owner.login === this.organization
            }));
        } catch (error) {
            throw new Error(`Failed to fetch forks: ${error.message}`);
        }
    }

    async getCommitHistory(owner, repo, branch = 'main', perPage = 10) {
        try {
            const { data: commits } = await this.octokit.repos.listCommits({
                owner,
                repo,
                sha: branch,
                per_page: perPage
            });
            return commits.map(commit => ({
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author,
                date: commit.commit.author.date,
                url: commit.html_url
            }));
        } catch (error) {
            throw new Error(`Failed to fetch commit history: ${error.message}`);
        }
    }

    async getRepositoryInfo(owner, repo) {
        try {
            const { data: repoInfo } = await this.octokit.repos.get({
                owner,
                repo
            });
            return {
                name: repoInfo.name,
                fullName: repoInfo.full_name,
                description: repoInfo.description,
                stars: repoInfo.stargazers_count,
                forks: repoInfo.forks_count,
                openIssues: repoInfo.open_issues_count,
                defaultBranch: repoInfo.default_branch,
                language: repoInfo.language,
                lastUpdated: repoInfo.updated_at,
                url: repoInfo.html_url,
                isFork: repoInfo.fork,
                sourceRepo: repoInfo.source ? {
                    owner: repoInfo.source.owner.login,
                    name: repoInfo.source.name,
                    url: repoInfo.source.html_url
                } : null
            };
        } catch (error) {
            throw new Error(`Failed to fetch repository info: ${error.message}`);
        }
    }

    async getBranchProtection(owner, repo, branch) {
        try {
            const { data: protection } = await this.octokit.repos.getBranchProtection({
                owner,
                repo,
                branch
            });
            return {
                requiredStatusChecks: protection.required_status_checks,
                enforceAdmins: protection.enforce_admins.enabled,
                requiredPullRequestReviews: protection.required_pull_request_reviews,
                restrictions: protection.restrictions
            };
        } catch (error) {
            if (error.status === 404) {
                return { protected: false };
            }
            throw new Error(`Failed to fetch branch protection: ${error.message}`);
        }
    }

    // Mukuru-specific methods
    async getMukuruOrganizationRepos() {
        try {
            const { data: repos } = await this.octokit.repos.listForOrg({
                org: this.organization,
                type: 'all',
                per_page: 100
            });
            return repos.map(repo => ({
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                isPrivate: repo.private,
                url: repo.html_url,
                defaultBranch: repo.default_branch,
                lastUpdated: repo.updated_at
            }));
        } catch (error) {
            throw new Error(`Failed to fetch Mukuru organization repos: ${error.message}`);
        }
    }

    async getForkStatus(owner, repo) {
        try {
            const { data: repoInfo } = await this.octokit.repos.get({
                owner,
                repo
            });
            
            if (!repoInfo.fork) {
                return {
                    isFork: false,
                    sourceRepo: null
                };
            }

            const { data: sourceRepo } = await this.octokit.repos.get({
                owner: repoInfo.source.owner.login,
                repo: repoInfo.source.name
            });

            return {
                isFork: true,
                sourceRepo: {
                    owner: sourceRepo.owner.login,
                    name: sourceRepo.name,
                    url: sourceRepo.html_url,
                    defaultBranch: sourceRepo.default_branch,
                    lastUpdated: sourceRepo.updated_at
                },
                forkDetails: {
                    owner: repoInfo.owner.login,
                    name: repoInfo.name,
                    url: repoInfo.html_url,
                    lastUpdated: repoInfo.updated_at
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch fork status: ${error.message}`);
        }
    }

    async compareWithUpstream(owner, repo, branch = 'main') {
        try {
            const forkStatus = await this.getForkStatus(owner, repo);
            if (!forkStatus.isFork) {
                throw new Error('Repository is not a fork');
            }

            const { data: comparison } = await this.octokit.repos.compareCommits({
                owner: forkStatus.sourceRepo.owner,
                repo: forkStatus.sourceRepo.name,
                base: branch,
                head: `${owner}:${branch}`
            });

            return {
                aheadBy: comparison.ahead_by,
                behindBy: comparison.behind_by,
                totalCommits: comparison.total_commits,
                commits: comparison.commits.map(commit => ({
                    sha: commit.sha,
                    message: commit.commit.message,
                    author: commit.commit.author,
                    date: commit.commit.author.date
                }))
            };
        } catch (error) {
            throw new Error(`Failed to compare with upstream: ${error.message}`);
        }
    }
}

module.exports = GitHubClient; 