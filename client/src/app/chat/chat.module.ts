import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './map/map.component';
import {ChatService} from './chat.service';
import {FormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatDividerModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [MapComponent],
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
  ],
  providers: [
    ChatService
  ]
})
export class ChatModule {
}
