import { Display } from "src/common";

export class UserGridResponseDto {
    id: number;

    @Display('نام و نام خانوادگی')
    fullName: string;

    @Display('نام کاربری')
    userName: string;

    @Display('آخرین به روز رسانی')
    updateAt: Date;

    @Display('دسترسی به همه ماشین ها')
    accessToAllVehicles: boolean;
}