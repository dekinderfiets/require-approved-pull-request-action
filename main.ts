import { getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

enum PullRequestState {
    Pending = "PENDING",
    ChangesRequested = "CHANGES_REQUESTED",
    Commented = "COMMENTED",
    Dismissed = 'DISMISSED',
    Approved = "APPROVED"
}

const getRequestedReviewers = async (kit: InstanceType<typeof GitHub>, context) => {
    const response = await kit.pulls.listRequestedReviewers({
        ...context.repo,
        pull_number: context.payload.pull_request.number
    });

    const users = new Array<String>();
    response.data.users.forEach((user) => {
        if (user.login === context.payload.pull_request.user.login) {
            return;
        }
        users.push(user.login);
    });

    const teams = new Map<String, Array<String>>();
    for (let team of response.data.teams) {
        const response = await kit.teams.listMembersInOrg({
            org: context.repo.owner,
            team_slug: team.name
        });

        const users = new Array<String>();
        response.data.forEach((user) => {
            if (user.login === context.payload.pull_request.user.login) {
                return;
            }
            users.push(user.login);
        });
        if (users.length) {
            teams.set(team.name, users);
        }
    }

    return {
        users,
        teams
    };
}

const getReviewers = async (kit, context) => {
    const response = await kit.pulls.listReviews({
        ...context.repo,
        pull_number: context.payload.pull_request.number,
		per_page: 10000,
    });

    const users = new Map<String, String>();
    response.data.forEach((review) => {
        if (!review.user) {
            return;
        }
        if (review.user.login === context.payload.pull_request.user.login) {
            return;
        }
        users.set(review.user.login, review.state);
    });

    return users;
};

const decideByState = (reviewer, state) => {
    switch (state) {
        case PullRequestState.Pending:
            setFailed(`There is a pending review from ${reviewer}`);
            break;
        case PullRequestState.ChangesRequested:
            setFailed(`Please implement the requested changes or dismiss the review from ${reviewer}`);
            break;
        case PullRequestState.Commented:
            setFailed(`There is a pending approval from ${reviewer}`);
            break;
        case PullRequestState.Dismissed:
            setFailed(`Dismissed review from ${reviewer}, re-request a review & wait for approval`);
            break;
        case PullRequestState.Approved:
            return;
    }
};

async function run() {
    try {
        if (context.eventName !== 'pull_request' && context.eventName !== 'pull_request_review') {
            setFailed(`Invalid event: ${context.eventName}, it should be use on pull_request or pull_request_review`);
            return;
        }

        const token = getInput("token");
        const kit = getOctokit(token);

        const requestedReviewers = await getRequestedReviewers(kit, context);
        const actualReviewers = await getReviewers(kit, context);

        actualReviewers.forEach((state: String, reviewer: String) => {
            if (requestedReviewers.users.includes(reviewer)) {
                return;
            }
            decideByState(reviewer, state);
        });

        requestedReviewers.users.forEach((reviewer: String) => {
            if (!actualReviewers.has(reviewer)) {
                setFailed(`Waiting for review from ${reviewer}`);
            }

            decideByState(reviewer, actualReviewers.get(reviewer));
        });

        requestedReviewers.teams.forEach((reviewers: String[], team: String) => {
            const reviewersApprovals = reviewers.filter((reviewer) => actualReviewers.has(reviewer));
            if (!reviewersApprovals.length) {
                setFailed(`Waiting for review from any member from ${team} (${reviewers.join(', ')})`);
            }

            reviewersApprovals.forEach((reviewer: String) => {
                if (actualReviewers.has(reviewer) || requestedReviewers.users.includes(reviewer)) {
                    return
                }
                decideByState(reviewer, actualReviewers.get(reviewer));
            });
        });
        return;
    } catch (e) {
        setFailed(`Exception: ${e}`);
        return
    }
}

run().catch((reason) => {
    setFailed(`Exception: ${reason}`)
})
