import { compareModels } from "../core/comparer.js";
import { recommend } from "../core/recommender.js";

export async function modelMatchCompare(params: { task: string; tokens?: number }) { return compareModels(params.task, params.tokens); }
export async function modelMatchRecommend(params: { task: string }) { return recommend(params.task); }
