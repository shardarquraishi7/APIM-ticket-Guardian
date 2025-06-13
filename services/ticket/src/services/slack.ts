import type { WebClient } from '@slack/web-api';
import { Message, Section } from 'slack-block-builder';
import { slackClient } from '@/lib/slack';
import { User } from '@/types/user';

export class SlackService {
  private webClient: WebClient;

  constructor(webClient: WebClient) {
    this.webClient = webClient;
  }

  async generateMessage(channelId: string, question: string, user: User) {
    return Message()
      .channel(channelId)
      .blocks(
        Section().text('Hey Folks! I was unable to answer the following question:'),
        Section().fields([question]),
        Section().text(`User: ${user.fullName} (${user.email})`),
      )
      .buildToObject();
  }

  async sendQuestionToSlack(channelId: string, question: string, user: User) {
    const message = await this.generateMessage(channelId, question, user);

    return this.webClient.chat.postMessage(message);
  }
}

export const slackService = new SlackService(slackClient);
