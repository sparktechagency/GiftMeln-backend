import { Types } from "mongoose"
import { IServay } from "./servey.interface"
import { SurveyModel } from "./servey.model"
import { get } from "http";

const createOrUpdateSurvey = async (payload: IServay) => {
    const { user, body } = payload;

    const survey = await SurveyModel.findOneAndUpdate(
        { user },
        {
            $set: { body }
        },
        { new: true, upsert: true, runValidators: true }
    );

    return survey;
};




// update survey
const updateSurveyIntoDB = async (id: string, payload: Partial<IServay>) => {
    if (!id) {
        throw new Error("Survey ID is required.");
    }

    if (!payload.body || !Array.isArray(payload.body)) {
        throw new Error("field is required.");
    }

    const bodyWithIds = payload.body.map(item => ({
        _id: new Types.ObjectId(),
        ...item
    }));

    const survey = await SurveyModel.findByIdAndUpdate(
        id,
        { $push: { body: { $each: bodyWithIds } } },
        { new: true, runValidators: true }
    );

    return survey;
};

// get servey for user
const getAllSurveysFromDB = async (userId: string) => {
    const surveys = await SurveyModel.find({ user: userId });

    return surveys.length > 0 ? surveys : null;
};


export const SurveyService = {
    createOrUpdateSurvey,
    updateSurveyIntoDB,
    getAllSurveysFromDB
}