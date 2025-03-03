import Joi from "joi";
import { CHECKS } from "../core/validation";

export const CommentsSchema = {
  getMovieComments: {
    params: Joi.object({
      movieId: CHECKS.id.required()
    }),
  },

  getUserComments: {
    params: Joi.object({
      email: CHECKS.email.required()
    }),
  },

  addComment: {
    body: Joi.object({
      movieId: CHECKS.id.required(),
      text: CHECKS.str.required()
    }),
  },

  updateComment: {
    params: Joi.object({
      commentId: CHECKS.id.required(),
    }),
    body: Joi.object({
      text: CHECKS.str.required(),
    }),
  },

  deleteComment: {
    params: Joi.object({
      commentId: CHECKS.id.required(),
    }),
  },
};
