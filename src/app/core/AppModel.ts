import {
  Attributes, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes,
  Model, ModelAttributes, ModelOptions, ModelStatic, Sequelize
} from "sequelize";
import { JSONSerializable, MakeRequired } from "./type";

import structuredClone from "../../helpers/structuredClone";

export { Model } from "sequelize";


export type ModelClass<M extends Model> = ModelStatic<M>;

export interface AppModel<
  AttributeType extends InferAttributes<AppModel> = { id: CreationOptional<number> },
  CreationAttributeType extends InferCreationAttributes<AppModel> = { id: CreationOptional<number> | undefined }
> extends Model<AttributeType, CreationAttributeType> {
  id: CreationOptional<number>
}


type NonSymbolKey = Exclude<PropertyKey, symbol>

export interface ModelData {
  [key: NonSymbolKey]: JSONSerializable | undefined
  // Cannot enforce type for symbol keys because of sequelize branded types.
  // Nontheless, symbol keys are not stored in database.
}

type getDataMethod = <M extends AppModelWithData, K extends keyof M["data"] & NonSymbolKey>(
  this: M, key: K) => M["data"][K] | undefined;

type setDataMethod = <M extends AppModelWithData, K extends keyof M["data"] & NonSymbolKey>(
  this: M, key: K, value?: M["data"][K]) => void;


export interface AppModelWithData<
  DataType extends ModelData = ModelData,
  AttributeType extends InferAttributes<AppModelWithData> = {
    id: CreationOptional<number>,
    data: CreationOptional<DataType>
  },
  CreationAttributeType extends InferCreationAttributes<AppModelWithData> = {
    id: CreationOptional<number> | undefined,
    data: CreationOptional<DataType> | undefined
  }
> extends AppModel<AttributeType, CreationAttributeType> {

  data: CreationOptional<DataType>,
  getData: getDataMethod,
  setData: setDataMethod
}

export function createModel<M extends AppModel, TAttributes = Attributes<M>>(
  modelName: string,
  attributes: Omit<ModelAttributes<M, TAttributes>, "id">,
  options: MakeRequired<ModelOptions<M>, "tableName">,
  sequelize: Sequelize,
): ModelClass<M> {

  const newAttributes = {
    ...attributes,
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
    },
  } as ModelAttributes<M, TAttributes>;
  return sequelize.define<M, TAttributes>(modelName, newAttributes, options);
}


export function createModelWithData<
  M extends AppModelWithData, TAttributes = Attributes<M>
>(
  modelName: string,
  attributes: Omit<ModelAttributes<M, TAttributes>, "id" | "data">,
  options: MakeRequired<ModelOptions<M>, "tableName">,
  sequelize: Sequelize,
): ModelClass<M> {

  const newAttributes = {
    ...attributes,
    data: {
      field: "data",
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    }
  } as ModelAttributes<M, TAttributes>;

  const ModelClass = createModel(modelName, newAttributes, options, sequelize);

  (ModelClass.prototype as AppModelWithData).getData = function getData<
    Md extends AppModelWithData, K extends keyof Md["data"] &(string | number)
  >(this: Md, key: K): M["data"][K] | undefined {
    const data = this.data[key];
    if (data) {
      return structuredClone(data);
    }
  };

  (ModelClass.prototype as AppModelWithData).setData = function setData<
    Md extends AppModelWithData, K extends keyof Md["data"] & NonSymbolKey
  >(this: Md, key: K, value?: M["data"][K]) {
    const data = this.data;

    let changed = false;
    if (value !== undefined) {
      data[key] = value;
      changed = true;
    } else if (typeof data[key] !== typeof undefined) {
      delete data[key];
      changed = true;
    }

    if (changed) {
      this.changed("data", true);
    }
  };

  return ModelClass;
}
