import catchAsync from "../../../shared/catchAsync";
import { DashboardService } from "./dashboaed.service";

const totalDeliveryAndSubscriber = catchAsync(async (req, res) => {
    const result = await DashboardService.totalDeliveryAndTotalSubscriber();
    res.status(200).json({
        success: true,
        message: 'Total delevery and total subscriber',
        data: result,
    });
});

export const DashboardController = {
    totalDeliveryAndSubscriber
}