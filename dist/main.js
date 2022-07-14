"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core_1 = require("@actions/core");
var github_1 = require("@actions/github");
var PullRequestState;
(function (PullRequestState) {
    PullRequestState["Pending"] = "PENDING";
    PullRequestState["ChangesRequested"] = "CHANGES_REQUESTED";
    PullRequestState["Commented"] = "COMMENTED";
    PullRequestState["Dismissed"] = "DISMISSED";
    PullRequestState["Approved"] = "APPROVED";
})(PullRequestState || (PullRequestState = {}));
var getRequestedReviewers = function (kit, context) { return __awaiter(void 0, void 0, void 0, function () {
    var response, users, teams, _loop_1, _i, _a, team;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, kit.pulls.listRequestedReviewers(__assign(__assign({}, context.repo), { pull_number: context.payload.pull_request.number }))];
            case 1:
                response = _b.sent();
                users = new Array();
                response.data.users.forEach(function (user) {
                    if (user.login === context.payload.pull_request.user.login) {
                        return;
                    }
                    users.push(user.login);
                });
                teams = new Map();
                _loop_1 = function (team) {
                    var response_1, users_1;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, kit.teams.listMembersInOrg({
                                    org: context.repo.owner,
                                    team_slug: team.name
                                })];
                            case 1:
                                response_1 = _c.sent();
                                users_1 = new Array();
                                response_1.data.forEach(function (user) {
                                    if (user.login === context.payload.pull_request.user.login) {
                                        return;
                                    }
                                    users_1.push(user.login);
                                });
                                if (users_1.length) {
                                    teams.set(team.name, users_1);
                                }
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, _a = response.data.teams;
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                team = _a[_i];
                return [5 /*yield**/, _loop_1(team)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, {
                    users: users,
                    teams: teams
                }];
        }
    });
}); };
var getReviewers = function (kit, context) { return __awaiter(void 0, void 0, void 0, function () {
    var response, users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, kit.pulls.listReviews(__assign(__assign({}, context.repo), { pull_number: context.payload.pull_request.number, per_page: 10000 }))];
            case 1:
                response = _a.sent();
                users = new Map();
                response.data.forEach(function (review) {
                    if (!review.user) {
                        return;
                    }
                    if (review.user.login === context.payload.pull_request.user.login) {
                        return;
                    }
                    users.set(review.user.login, review.state);
                });
                return [2 /*return*/, users];
        }
    });
}); };
var decideByState = function (reviewer, state) {
    switch (state) {
        case PullRequestState.Pending:
            (0, core_1.setFailed)("There is a pending review from ".concat(reviewer));
            break;
        case PullRequestState.ChangesRequested:
            (0, core_1.setFailed)("Please implement the requested changes or dismiss the review from ".concat(reviewer));
            break;
        case PullRequestState.Commented:
            (0, core_1.setFailed)("There is a pending approval from ".concat(reviewer));
            break;
        case PullRequestState.Dismissed:
            (0, core_1.setFailed)("Dismissed review from ".concat(reviewer, ", re-request a review & wait for approval"));
            break;
        case PullRequestState.Approved:
            return;
    }
};
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var token, kit, requestedReviewers_1, actualReviewers_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (github_1.context.eventName !== 'pull_request' && github_1.context.eventName !== 'pull_request_review') {
                        (0, core_1.setFailed)("Invalid event: ".concat(github_1.context.eventName, ", it should be use on pull_request or pull_request_review"));
                        return [2 /*return*/];
                    }
                    token = (0, core_1.getInput)("token");
                    kit = (0, github_1.getOctokit)(token);
                    return [4 /*yield*/, getRequestedReviewers(kit, github_1.context)];
                case 1:
                    requestedReviewers_1 = _a.sent();
                    return [4 /*yield*/, getReviewers(kit, github_1.context)];
                case 2:
                    actualReviewers_1 = _a.sent();
                    actualReviewers_1.forEach(function (state, reviewer) {
                        if (requestedReviewers_1.users.includes(reviewer)) {
                            return;
                        }
                        decideByState(reviewer, state);
                    });
                    requestedReviewers_1.users.forEach(function (reviewer) {
                        if (!actualReviewers_1.has(reviewer)) {
                            (0, core_1.setFailed)("Waiting for review from ".concat(reviewer));
                        }
                        decideByState(reviewer, actualReviewers_1.get(reviewer));
                    });
                    requestedReviewers_1.teams.forEach(function (reviewers, team) {
                        var reviewersApprovals = reviewers.filter(function (reviewer) { return actualReviewers_1.has(reviewer); });
                        if (!reviewersApprovals.length) {
                            (0, core_1.setFailed)("Waiting for review from any member from ".concat(team, " (").concat(reviewers.join(', '), ")"));
                        }
                        reviewersApprovals.forEach(function (reviewer) {
                            if (actualReviewers_1.has(reviewer) || requestedReviewers_1.users.includes(reviewer)) {
                                return;
                            }
                            decideByState(reviewer, actualReviewers_1.get(reviewer));
                        });
                    });
                    return [2 /*return*/];
                case 3:
                    e_1 = _a.sent();
                    (0, core_1.setFailed)("Exception: ".concat(e_1));
                    return [2 /*return*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
run()["catch"](function (reason) {
    (0, core_1.setFailed)("Exception: ".concat(reason));
});
