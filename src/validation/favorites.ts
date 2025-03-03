import Joi from "joi";
import { CHECKS } from "../core/validation";

export const FavoritesSchema = {
  addFavorite: {
    body: Joi.object({
      movieId: CHECKS.id.required(),
      feedBack: CHECKS.str,
      viewed: CHECKS.bool,
    }),
  },

  updateFavorite: {
    params: Joi.object({
      id: CHECKS.id.required(),
    }),
    body: Joi.object({
      feedBack: CHECKS.str,
      viewed: CHECKS.bool,
    }),
  },

  deleteFavorite: {
    params: Joi.object({
      id: CHECKS.id.required(),
    }),
  },
};
