import {
  BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, HasManyAddAssociationMixin, HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes,
  InferCreationAttributes, NonAttribute
} from "sequelize";

import {
  createModelWithData, ModelClass, ModelData, AppModelWithData
} from "../../app/AppModel";
import Database from "../modules/Database";

import type { RaceModel } from "./raceModel";

export const RACEGROUP_MAX_NAME_LENGTH = 24;


export interface RaceGroupData extends ModelData {}

export interface RaceGroupModel extends AppModelWithData<
  RaceGroupData,
  InferAttributes<RaceGroupModel>,
  InferCreationAttributes<RaceGroupModel>
> {
  id: CreationOptional<number>;
  parentId?: ForeignKey<RaceGroupModel["id"]>;
  name: string;

  getParent: BelongsToGetAssociationMixin<RaceGroupModel>;
  setParent: BelongsToSetAssociationMixin<RaceGroupModel, number>;
  createParent: BelongsToCreateAssociationMixin<RaceGroupModel>;

  getChildren: HasManyGetAssociationsMixin<RaceGroupModel[]>;
  setChildren: HasManySetAssociationsMixin<RaceGroupModel, number>;
  addChild: HasManyAddAssociationMixin<RaceGroupModel, number>;
  addChildren: HasManyAddAssociationsMixin<RaceGroupModel, number>;
  removeChild: HasManyRemoveAssociationMixin<RaceGroupModel, number>;
  removeChildren: HasManyRemoveAssociationsMixin<RaceGroupModel, number>;
  hasChild: HasManyHasAssociationMixin<RaceGroupModel, number>;
  hasChildren: HasManyHasAssociationsMixin<RaceGroupModel, number>;
  countChildren: HasManyCountAssociationsMixin;
  createChild: HasManyCreateAssociationMixin<RaceGroupModel, "parentId">;

  getRaces: HasManyGetAssociationsMixin<RaceModel[]>;
  setRaces: HasManySetAssociationsMixin<RaceModel, number>;
  addRace: HasManyAddAssociationMixin<RaceModel, number>;
  addRaces: HasManyAddAssociationsMixin<RaceModel, number>;
  removeRace: HasManyRemoveAssociationMixin<RaceModel, number>;
  removeRaces: HasManyRemoveAssociationsMixin<RaceModel, number>;
  hasRace: HasManyHasAssociationMixin<RaceModel, number>;
  hasRaces: HasManyHasAssociationsMixin<RaceModel, number>;
  countRaces: HasManyCountAssociationsMixin;
  createRace: HasManyCreateAssociationMixin<RaceModel, "raceGroupId">;

  parent?: NonAttribute<RaceGroupModel>;
  child?: NonAttribute<RaceGroupModel[]>;
  races?: NonAttribute<RaceModel[]>;
}

export type RaceGroupModelClass = ModelClass<RaceGroupModel>


export default function createRaceGroupModel(
  db: Database
): RaceGroupModelClass {
  const sequelize = db.sequelize;

  const RaceGroup = createModelWithData<RaceGroupModel>("RaceGroup", {
    parentId: {
      field: "parent_id",
      type: DataTypes.INTEGER,
      references: {
        model: "RaceGroup",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    name: {
      field: "name",
      type: DataTypes.STRING(RACEGROUP_MAX_NAME_LENGTH),
      allowNull: false,
      unique: true
    },
  }, {
    tableName: "race_groups"
  }, sequelize);

  RaceGroup.hasMany(RaceGroup, {
    as: "children",
    foreignKey: { name: "parentId" }
  });

  RaceGroup.belongsTo(RaceGroup, {
    as: "parent",
    foreignKey: { name: "parentId" }
  });

  return RaceGroup;
}
