import { Model } from 'mongoose';

export type IEventCategory = {
  eventCategory:
    | 'Christmas'
    | 'Birthday'
    | 'LaborDay'
    | 'ValentinesDay'
    | 'Easter'
    | 'MemorialDay'
    | 'CustomDay';
};

export type EventCategoryModel = Model<IEventCategory>;
