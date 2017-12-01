import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { QuestionPage } from "../pages/question/question";
import { AnswerPage } from "../pages/answer/answer";

import { AnimationService } from "css-animator";
import { VotingButtonComponent } from "../components/voting-button/voting-button";
import { HttpClientModule } from "@angular/common/http";
import { QuizServiceProvider } from '../providers/quiz-service/quiz-service';

@NgModule({
  declarations: [
    MyApp,
    QuestionPage,
    AnswerPage,
    VotingButtonComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {}, {
      links: [
        { component: QuestionPage, name: 'Question', segment: 'question/:quizItemId/:browseMode' }
      ]
    }),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    QuestionPage,
    AnswerPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AnimationService,
    QuizServiceProvider
  ]
})
export class AppModule {}
