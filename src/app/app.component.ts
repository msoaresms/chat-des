import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { breakPuzzle, generatePuzzles } from './shared/puzzle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public chatForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    let { msgs, keys } = generatePuzzles();
    // breakPuzzle(msgs);

    // testDES();
  }
}
