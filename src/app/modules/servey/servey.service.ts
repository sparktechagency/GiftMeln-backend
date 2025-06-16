import { Types } from 'mongoose';
import { IServay } from './servey.interface';
import { SurveyModel } from './servey.model';
import { get } from 'http';
import { JwtPayload } from 'jsonwebtoken';

const createOrUpdateSurvey = async (payload: IServay) => {
  const { user, body } = payload;

  const survey = await SurveyModel.findOneAndUpdate(
    { user },
    {
      $set: { body },
    },
    { new: true, upsert: true, runValidators: true },
  );

  return survey;
};

// get single one

const getSingleSurvey = async (id: string) => {
  const survey = await SurveyModel.findOne({ user: id });
  if (!survey) {
    throw new Error('Survey not found.');
  }
  return survey;
};

// update survey
const updateSurveyIntoDB = async (id: string, payload: Partial<IServay>) => {
  if (!id) {
    throw new Error('Survey ID is required.');
  }

  if (!payload.body || !Array.isArray(payload.body)) {
    throw new Error('field is required.');
  }

  const bodyWithIds = payload.body.map(item => ({
    _id: new Types.ObjectId(),
    ...item,
  }));

  const survey = await SurveyModel.findByIdAndUpdate(
    id,
    { $push: { body: { $each: bodyWithIds } } },
    { new: true, runValidators: true },
  );

  return survey;
};

// get servey for user
const getAllSurveysFromDB = async (userId: string, authId?: string) => {
  const surveys = await SurveyModel.find({ user: userId || authId });

  return surveys.length > 0 ? surveys : null;
};

// get all
const getAllSurveys = async () => {
  const surveys = await SurveyModel.find({});
  if (!surveys) {
    return [];
  }
  return surveys;
};

export const SurveyService = {
  createOrUpdateSurvey,
  updateSurveyIntoDB,
  getAllSurveysFromDB,
  getSingleSurvey,
  getAllSurveys,
};
