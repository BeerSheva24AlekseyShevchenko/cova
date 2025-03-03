import { NextFunction, Request, Response } from 'express';
import { connectToDB } from '../core/db';
import { ObjectId } from 'mongodb';
import { AppError } from '../core/errors';

export const getMovieComments = async (movieId: string) => {
  const db = await connectToDB();
  const comments = await db.collection('comments')
    .find({ movie_id: new ObjectId(movieId) })
    .project({ email: 1, text: 1, _id: 0 })
    .toArray();

  return comments;
};

export const getComment = async (commentId: string) => {
  const db = await connectToDB();
  const comment = await db.collection('comments').findOne({ _id: new ObjectId(commentId) });

  return comment;
};

export const getUserComments = async (email: string) => {
  const db = await connectToDB();
  const comments = await db.collection('comments').find({ email: email }).toArray();

  return comments;
};

export const addComment = async (data: any) => {
  const { movieId, email, text } = data;
  const db = await connectToDB();
  const user = await db.collection('users').findOne({ _id: email });
  if (!user) throw new AppError('User not found', 404);

  const newComment = {
    _id: new ObjectId(),
    movie_id: new ObjectId(movieId),
    name: user.name,
    email,
    text,
    date: new Date(),
  };

  const result = await db.collection('comments').insertOne(newComment);
  if(!result) throw new AppError('Failed to add comment', 500);

  await db.collection('movies').updateOne(
    { _id: newComment.movie_id },
    { $inc: { num_mflix_comments: 1 } }
  );

  return newComment;
};

export const updateComment = async (commentId: string, text: string) => {
  const db = await connectToDB();
  const result = await db.collection('comments').findOneAndUpdate(
      { _id: new ObjectId(commentId) },
      { $set: { text: text, date: new Date() } },
      { returnDocument: 'after' }
  );
  if(!result) throw new AppError('Comment not found', 404);

  return result;
};

export const deleteComment = async (commentId: string) => {
  const db = await connectToDB();
  const result = await db.collection('comments').findOneAndDelete({ _id: new ObjectId(commentId)});
  if(!result) throw new AppError('Comment not found', 404);

  await db.collection('movies').updateOne(
    { _id: result.movie_id },
    { $inc: { num_mflix_comments: -1 } }
  );

  return result;
};
