import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'replaceDiscordEmoji'
})
export class DiscordEmojiPipe implements PipeTransform {

constructor(private sanitizer: DomSanitizer) { }

public transform(message: string, size: number): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(
    message
      .split(' ')
      .map(word => {
        const matches = word.match(/&lt;a?:([a-zA-Z0-9_]+):([0-9]+)&gt;/);
        if (!matches || !matches[0] || !matches[1] || !matches[2]) return word;
        const ext = word.includes('&lt;a:') ? 'gif' : 'png';
        return `
          <img class="discord-emoji" alt="${matches[1]}" src="https://cdn.discordapp.com/emojis/${matches[2]}.${ext}?v=1" style="height: ${size}px; width: ${size}px" />
        `;
      })
      .join(' ')
  );
}
}
