import {
  Attributes, CreationAttributes, FindOptions as SequelizeFindOptions, Includeable,
  Op, WhereOptions
} from "sequelize";
import { AppModel, AppModelWithData, ModelClass } from "./AppModel";
import { KeysByValueType } from "./type";


export type RepositoryFilter<M extends AppModel> = WhereOptions<Attributes<M>>

export interface RepositoryFindOptions<M extends AppModel> {
  pagination?: { pageSize: number, pageNumber: number };

  // Ignored if 'pagination' is set
  limit?: number;

  filter?: RepositoryFilter<M>;

  include?: Includeable | Includeable[];
}


export default abstract class AppRepository<
  M extends AppModel,
  FindOptions extends RepositoryFindOptions<M> = RepositoryFindOptions<M>
> {

  static combineFilters<Md extends AppModel>(
    filter1?: RepositoryFilter<Md>,
    filter2?: RepositoryFilter<Md>,
    // Combine using 'OR' instead of 'AND'.
    useOr: boolean = false
  ): RepositoryFilter<Md> | undefined {
    if (!filter1) { return filter2; }
    if (!filter2) { return filter1; }

    const op = useOr ? Op.or : Op.and;
    return {
      [op]: [filter1, filter2]
    } as RepositoryFilter<Md>;
  }

  static strAttrFilter<Md extends AppModel>(
    attr: KeysByValueType<Attributes<Md>, string>,
    str: string,
    caseSensitive: boolean = false
  ) {
    const op = caseSensitive ? Op.like : Op.iLike;

    return {
      [attr]: { [op]: `%${str}%` }
      // Type coercion necessary because typescript is recognizing 'attr' type
      // as just 'string' when validating 'WhereOptions' type.
    } as RepositoryFilter<Md>;
  }

  static dataFilter<Md extends AppModelWithData>(dataFilter: {}) {
    const filter: RepositoryFilter<Md> = {
      data: dataFilter
    };
    return filter;
  }

  constructor(
    modelClass: ModelClass<M>
  ) {
    this.modelClass = modelClass;
  }

  async findById(id: number, options?: FindOptions) {
    const queryOptions = this.processOptions(options);
    return await this.modelClass.findByPk(id, queryOptions);
  }

  async findOne(options?: FindOptions) {
    const queryOptions = this.processOptions(options);
    return await this.modelClass.findOne(queryOptions);
  }

  async findOrCreateOne(
    values: CreationAttributes<M>,
    options?: FindOptions
  ) {
    const model = await this.findOne(options);
    return model || await this.create(values);
  }

  async findMany(options?: FindOptions) {
    const queryOptions = this.processOptions(options);
    return await this.modelClass.findAll(queryOptions);
  }

  async findAndCountMany(options?: FindOptions) {
    const queryOptions = this.processOptions(options);
    return await this.modelClass.findAndCountAll(queryOptions);
  }

  async count(options?: FindOptions) {
    const queryOptions = this.processOptions(options);
    return await this.modelClass.count(queryOptions);
  }

  async create(values: CreationAttributes<M>) {
    return await this.modelClass.create(values);
  }

  async update(instanceOrId: M | number, values: Partial<Omit<Attributes<M>, "id">>) {
    let instance: M | null;
    if (typeof instanceOrId === "number") {
      instance = await this.findById(instanceOrId);
    } else {
      instance = instanceOrId;
    }

    if (instance === null) { return null; }
    instance.set(values);
    return instance;
  }

  async save(instance: M) {
    return await instance.save();
  }

  async delete(instance: M) {
    return await instance.destroy();
  }

  protected processOptions(options?: FindOptions) {
    const queryOptions: SequelizeFindOptions<Attributes<M>> = {};

    if (options?.filter) {
      queryOptions.where = options.filter;
    }

    if (options?.include) {
      queryOptions.include = options.include;
    }

    if (options?.pagination) {
      const { pageSize, pageNumber } = options.pagination;

      queryOptions.limit = pageSize;
      queryOptions.offset = (pageNumber - 1) * pageSize;
    } else if (options?.limit) {
      queryOptions.limit = options.limit;
    }

    return queryOptions;
  }

  protected readonly modelClass;
}
