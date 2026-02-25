import { Model, Table, Column, DataType, } from "sequelize-typescript";

export enum TradeInProfileStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING'
}

@Table({
    timestamps: true,
    tableName: "tradein_profiles",
    underscored: true,
    paranoid: true,
})
export class TradeInProfile extends Model {
    @Column({ type: DataType.DATE, })
    declare createdAt: Date;

    @Column({ type: DataType.DATE, })
    declare updatedAt: Date;

    @Column({ type: DataType.DATE, })
    declare deletedAt: Date;

    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare id: string;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare userId: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare externalId: string;

    @Column({
        type: DataType.STRING,
        defaultValue: 'ZANIBAL'
    })
    declare provider: string;

    @Column({
        type: DataType.ENUM(...Object.values(TradeInProfileStatus)),
        defaultValue: TradeInProfileStatus.ACTIVE
    })
    declare status: TradeInProfileStatus;
}
