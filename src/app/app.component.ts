import { Component, OnInit } from '@angular/core';
import { breakPuzzle, generatePuzzles, testDES } from './shared/puzzle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'chat-des';

  ngOnInit() {
    let {msgs, keys} = generatePuzzles();
    breakPuzzle(msgs, keys);

    // testDES();
  }
}
