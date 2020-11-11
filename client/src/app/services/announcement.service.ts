import { Injectable } from '@angular/core';

import { truncate } from 'lodash';
import Parser from 'rss-parser/dist/rss-parser';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  public get latestAnnouncement() {
    const announcement = this.allAnnouncements[0];
    if (!announcement) return null;

    return {
      title: announcement.title,
      link: announcement.link,
      author: announcement.author,
      summary: truncate(announcement.contentSnippet, { length: 300 })
    };
  }

  private allAnnouncements: any[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    const parser = new Parser();
    const feed = await parser.parseURL('https://landoftherair.github.io/feed.xml');

    this.allAnnouncements = feed.items;
  }

}
