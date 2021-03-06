import {Component, ViewChild} from '@angular/core';
import {QuizItem} from "../../app/quizitem";
import {NavController, NavParams,} from "ionic-angular";
import * as _ from "lodash";
import {QuizServiceProvider} from "../../providers/quiz-service/quiz-service";
import {ENV} from '@app/env';
import {AnimationBuilder, AnimationService} from "css-animator";
import {QuizMetadata} from "../../app/quizmetadata";
import {AuthPage} from "../auth/auth";

@Component({
    selector: 'page-question',
    templateUrl: 'question.html',
    providers: []
})
export class QuestionPage {
    @ViewChild('question') questionElement;
    @ViewChild('imageview') imageViewElement;

    quizItem: QuizItem;
    quizData: QuizItem[];
    quizItemIndex: number;
    nextQuizItemId: number;
    prevQuizItemId: number;
    browseMode: boolean;
    reloadIntervalId: any;
    questionAnimIntervalId: any;
    mode: string = ENV.mode;
    pollInterval: number = 120;
    private animator: AnimationBuilder;
    public errorMessage: string;

    goToPage(quizItemId: number) {
        this.quizItemIndex = Math.max(0, Math.min(quizItemId, this.quizData.length));
        this.quizItem = this.quizData[this.quizItemIndex];
        this.updateNavIndexes();
    }

    constructor(
        public navCtrl: NavController,
        private navParams: NavParams,
        private quizService: QuizServiceProvider,
        animationService: AnimationService)
    {
        this.animator = animationService.builder();
    }

    loadData(): void {
        const quizMetadata: QuizMetadata = this.navParams.get('quizMetadata');
        this.browseMode = this.mode === "dev";
        if (!quizMetadata) {
            return;
        }
        this.quizService.getQuiz(quizMetadata.id)
            .subscribe(
                (quizData) => {
                    if (!quizData || quizData.length === 0) {
                        return;
                    }
                    if (quizData.length !== _.toNumber(quizMetadata.numberOfItems)) {
                        this.errorMessage = "One or more quiz items were not loaded properly.<br><br>Please contact IT Support."
                    } else {
                        this.errorMessage = "";
                    }
                    this.quizData = quizData;
                    this.quizItemIndex = QuestionPage.findQuizItemIndexByDate(quizData);
                    this.quizItem = this.quizData[this.quizItemIndex];
                    if (this.browseMode) {
                        this.updateNavIndexes();
                    }
                },
                (error) => {
                    if (error.status === 401) {
                        this.navCtrl.push(AuthPage);
                    }
                    console.error("Error loading quiz! " + error);
                    this.errorMessage = "CoffeeQuiz cannot read data from the server.<br><br>Please check you Internet connection.";
                });
    }

    updateNavIndexes(): void {
        this.prevQuizItemId = this.quizItemIndex > 0 ? this.quizItemIndex - 1 : undefined;
        this.nextQuizItemId = this.quizItemIndex < (this.quizData.length - 1) ? this.quizItemIndex + 1 : undefined;
    }

    static findQuizItemIndexByDate(quizData: QuizItem[]): number {
        const possibleIndex = _.sortedIndex(quizData.map(quizItem => quizItem.startTime), new Date()) - 1;
        return Math.max(0, possibleIndex);
    }

    // noinspection JSUnusedGlobalSymbols
    ngOnInit() {
        if (!this.browseMode) {
            console.log(`Server poll interval: ${this.pollInterval} seconds`);
            setTimeout(() => {
                this.reloadIntervalId = setInterval(() => this.loadData(), this.pollInterval * 1000);
            }, 30000);
        }
        else {
            console.log("Browse mode. Not polling server.");
        }
        this.loadData();
        setTimeout(() => {
            this.questionAnimIntervalId = setInterval(() => this.animateQuestion(),20000);
        }, 5000);


    }

    animateQuestion() {
        const rowElement = this.questionElement.nativeElement.parentNode;
        const parentHeight = rowElement.offsetHeight;
        const prevStyleHeight = rowElement.style.height;
        rowElement.style.height = parentHeight + 'px';
        this.animator
            .setOptions({
                type: 'rubberBand',
                reject: false,
                fixed: false
            })
            .animate(this.questionElement.nativeElement)
            .then(() => {
                rowElement.style.height = prevStyleHeight;
            });
    }

    // noinspection JSUnusedGlobalSymbols
    ngOnDestroy() {
        if (this.reloadIntervalId) {
            clearInterval(this.reloadIntervalId);
        }
        if (this.questionAnimIntervalId) {
            clearInterval(this.questionAnimIntervalId);
        }
    }
}
