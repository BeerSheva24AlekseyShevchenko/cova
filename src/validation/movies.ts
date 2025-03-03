import Joi from "joi";
import { CHECKS } from "../core/validation";

export const MoviesSchema = {
  getMovie: {
    params: Joi.object({
      id: CHECKS.id.required()
    }),
  },

  getMostRated: {
    query: Joi.object({
      amount: CHECKS.strAsInt.required(),
      year: CHECKS.strAsYear,
      actor: CHECKS.str,
      genres: CHECKS.str,
      language: CHECKS.str,
    }),
  },

  getMostCommented: {
    query: Joi.object({
      amount: CHECKS.strAsInt.required(),
      year: CHECKS.strAsYear,
      actor: CHECKS.str,
      genres: CHECKS.str,
      language: CHECKS.str,
    }),
  },

  addRate: {
    body: Joi.object({
      id: CHECKS.int.required(),
      rating: CHECKS.rating.required(),
    }),
  },
};
