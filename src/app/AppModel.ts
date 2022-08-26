import {
  Attributes, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ModelAttributes,
  ModelOptions, ModelStatic, Sequelize
} from "sequelize";
import { JSONSerializable, RequiredProperties } from "../core/type";

import structuredClone from "../helpers/structuredClone";


export { Model } from "sequelize";


export type ModelClass<M extends Model> = ModelStatic<M>;


type NonSymbolKey = Exclude<PropertyKey, symbol>

export interface ModelData {
  [key: NonSymbolKey]: JSONSerializable | undefined
  // Cannot enforce type for symbol keys because of sequelize branded types.
  // Nontheless, symbol keys are not stored in database.
}


type getDataMethod = <M extends ModelWithData, K extends keyof M["data"] & NonSymbolKey>(
  this: M, key: K) => M["data"][K] | undefined;

type setDataMethod = <M extends ModelWithData, K extends keyof M["data"] & NonSymbolKey>(
  this: M, key: K, value?: M["data"][K]) => void;

export interface ModelWithData<
  DataType extends ModelData = ModelData,
  AttributeType extends InferAttributes<ModelWithData> = { data: CreationOptional<DataType> },
  CreationAttributeType extends InferCreationAttributes<ModelWithData> = { data: CreationOptional<DataType> | undefined }
> extends Model<AttributeType, CreationAttributeType> {

  data: CreationOptional<DataType>,
  getData: getDataMethod,
  setData: setDataMethod
}

export function createModel<M extends Model, TAttributes = Attributes<M>>(
  modelName: string,
  attributes: ModelAttributes<M, TAttributes>,
  options: RequiredProperties<ModelOptions<M>, "tableName">,
  sequelize: Sequelize,
): ModelClass<M> {
  return sequelize.define<M, TAttributes>(modelName, attributes, options);
}


export function createModelWithData<
  M extends ModelWithData, TAttributes = Attributes<M>
>(
  modelName: string,
  attributes: Omit<ModelAttributes<M, TAttributes>, "data">,
  options: RequiredProperties<ModelOptions<M>, "tableName">,
  sequelize: Sequelize,
): ModelStatic<M> {

  const newAttributes = {
    ...attributes,
    data: {
      field: "data",
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    }
  } as ModelAttributes<M, TAttributes>;

  const ModelClass = sequelize.define<M, TAttributes>(
    modelName, newAttributes, options
  );

  (ModelClass.prototype as ModelWithData).getData = function getData<
    Md extends ModelWithData, K extends keyof Md["data"] &(string | number)
  >(this: Md, key: K): M["data"][K] | undefined {
    const data = this.data[key];
    if (data) {
      return structuredClone(data);
    }
  };

  (ModelClass.prototype as ModelWithData).setData = function setData<
    Md extends ModelWithData, K extends keyof Md["data"] & NonSymbolKey
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
