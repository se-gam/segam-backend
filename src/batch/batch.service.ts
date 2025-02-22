import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { StudyroomBatchInfoDto } from './dto/studyroomBatchInfo.dto';
import { CronTime } from 'cron';

@Injectable()
export class BatchService {
    constructor(private schedulerRegistry: SchedulerRegistry) {}

    async getStudyroomBatchInfo(): Promise<StudyroomBatchInfoDto> {
        const cronJob = this.schedulerRegistry.getCronJob(
            'studyroomSlotCrawler'
        );

        return {
            isRunning: cronJob.running,
            cronTime: cronJob.cronTime.source.toString(),
            lastFiredAt: cronJob.lastDate(),
        };
    }

    async activateStudyroomSlotCrawler() {
        const cronJob = this.schedulerRegistry.getCronJob(
            'studyroomSlotCrawler'
        );

        cronJob.start();
    }

    async deactivateStudyroomSlotCrawler() {
        const cronJob = this.schedulerRegistry.getCronJob(
            'studyroomSlotCrawler'
        );

        cronJob.stop();
    }

    async changeStudyroomSlotCrawlerCronTime(rawCronTime: string) {
        const cronJob = this.schedulerRegistry.getCronJob(
            'studyroomSlotCrawler'
        );

        const cronTime = new CronTime(rawCronTime);

        cronJob.setTime(cronTime);
    }
}
