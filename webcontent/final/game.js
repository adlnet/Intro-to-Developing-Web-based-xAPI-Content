 function Question(questionText,answers,correctIndex)
 {
     this.questionText = questionText;
     this.answers = answers;
     this.correctIndex = correctIndex;  
 }

function exportController(scope)
{
    window.getQuizController = function(){
        return scope;
    }
}

var app = angular.module("quiz", ['ngAnimate']);

app.controller("quizController", function($scope) {
   
        self = $scope;
        exportController(self);
     	self.events = {};
        self.questions = [
            new Question("What is your name",[
                "Rob","Tom", "Rob Tomas"],2),
            new Question("What is your favorite color",[
                "Red","Blue", "Red. No I mean blue!?"],2),
            new Question("What is the airspeed of an unladden swallow",[
                "42 m/hr","42 k/hr", "What do you mean, an african or european swallow?"],2)
        ]
        self.activeQuestion = 0;
        self.quizSubmitted = false;
        self.started = false;

     	self.on = function( event, handler )
     	{
     		this.events[ event ] = handler;
     	}
     	self.raise = function( event )
     	{
           
            var args = [];
            for(var i =1; i < arguments.length; i++)
                args.push(arguments[i]);
     		if ( this.events[ event ] )
     			this.events[ event ].apply(null,args)
     	}
     		// local functions
     	self.startQuiz =function(  )
     	{
     		this.raise( "started", new Date() );
            this.started = true;
     	}
        self.nextQuestion = function()
        {
        
            var question = this.questions[this.activeQuestion].questionText;
            var answer = this.questions[this.activeQuestion].answers[this.answerIndex]
            var success = this.answerIndex == this.questions[this.activeQuestion].correctIndex;

            this.questions[this.activeQuestion].success = success;

            this.raise( "answered", this.activeQuestion, question,answer,success );

            this.answerIndex = -1;
            if(this.activeQuestion < this.questions.length-1)
                this.activeQuestion += 1;
            else
            {
                var totalCorrect = this.questions.filter(function(e){return e.success}).length;

                this.raise( "finished", totalCorrect, this.questions.length);   
                this.quizSubmitted = true;             
            }
        }
     	self.setAnswer=function( answerIndex )
     	{
     		this.answerIndex = answerIndex;
     	}   
});