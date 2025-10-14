import AppRouter from './AppRouter';

const appRouter = AppRouter();
appRouter.initUploadRouter();
appRouter.initPhotoRouter();
appRouter.initUsersRouter();
appRouter.initNegotiableInstrumentTypesRouter();
appRouter.initIndicatorsRouter();
appRouter.initAlertConditionExpressionsRouter();
appRouter.initAlertConditionOperationsRouter();
appRouter.initNegotiableInstrumentsRouter();
appRouter.initBymaStocksDataRouter();
appRouter.initAlertsRouter();
appRouter.initAlertsTargetNegotiableInstrumentsRouter();
appRouter.initAlertsTargetNegotiableInstrumentsRouter();

export default appRouter.getApp();
