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



new Question("What special feature makes the smartcard so flexible to use?",[
"the ability to protect stored information",
"the use of a microprocessor and programmable memory",
"the high speeds at which it is able to operate",
"the capability of storing huge amounts of information per unit of area"],1),

new Question("Which of the following does NOT use a 'Cryptographical Technique' to protect data?",[ 
"the use of digital signatures",
"data encryption",
"the use of stored encrypted password files",
"using asymmetric keys at 'sender' and 'receiver' nodes"],2),

new Question("What characteristic makes the internet so attractive?",[ 
"the 'secure' surroundings within which it is implemented",
"the ability to provide an open, easy-to-use network",
"it eliminates the need for firewalls",
"you don't require a fast computer to use the internet"],1),

new Question("Why is it important for the internet to implement protocols?",[ 
"to provide a universal data 'platform' for all connections to use",
"so that nobody gets confused",
"to enable the use of cryptographical techniques",
"to prevent the use of viruses"],0),

new Question("Which of the following is NOT an example of a smartcard?",[ 
"a credit card which can be used to operate a mobile phone",
"an electronic money card e.g Mondex",
"a drivers licence containing current information about bookings etc.",
"an access control card containing a digitised photo"],3),

new Question("Which of the following is the primary cause of 'invisible' damage? (i.e damage is of unknown extent) ",[ 
"viruses",
"computer misuse",
"computer fraud",
"theft"],0),

new Question("What type of signal is generally used, between the badge and sensor, in an active badge system?",[ 
"radio waves",
"ultrasonic",
"satellite communication",
"infra-red"],3),

new Question("What method is used to receive information, from the sensor to the workstation, in an active badge system?",[ 
"frequency division multiplexing",
"time division multiplexing",
"first-in first-out mechanism (FIFO)",
"random detection"],2),

new Question("Why will specific active badges NOT work with all active badge systems?",[ 
"they operate at different frequencies",
"they use different coding mechanisms",
"they adopt different methods of transmission",
"they can only be used in certain environments"],1),

new Question("Which of the following methods can most effectively be used to prevent logical breach of security?",[ 
"operating system and other system software",
"computer architectural design",
"distributed systems design",
"network design"],0),

new Question("Why are traditional authentication methods unsuitable for use in computer networks?",[ 
"they do not use cryptographical techniques",
"they do not permit high speed data flow",
"they use passwords",
"they are incompatible with the internet"],0),

new Question("What can a firewall protect against?",[ 
"viruses",
"unauthenticated interactive logins from the 'outside' world",
"fire",
"connecting to and from the 'outside' world"],1),

new Question("What is the main purpose of access control?",[ 
"to authorise full access to authorised users",
"to limit the actions or operations that a legitimate user can perform",
"to stop unauthorised users accessing resources",
"to protect computers from viral infections"],1),

new Question("Which of the following is NOT a good property of a firewall?",[ 
"only authorised traffic must be allowed to pass through it",
"the firewall itself, should be immune to penetration",
"it should allow for easy modification by authorised users",
"traffic must only be allowed to pass from inside to outside the firewall"],3)

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
        self.setActor = function(actor)
        {
            this.actor = actor;
            this.$apply();
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
                this.stats = {
                    correct:totalCorrect
                }
                this.raise( "finished", totalCorrect, this.questions.length);   
                this.quizSubmitted = true;             
            }
        }
     	self.setAnswer=function( answerIndex )
     	{
     		this.answerIndex = answerIndex;
            var question = this.questions[this.activeQuestion].questionText;
            var answer = this.questions[this.activeQuestion].answers[this.answerIndex]
            var success = this.answerIndex == this.questions[this.activeQuestion].correctIndex;
            this.raise( "guessed", this.activeQuestion, question,answer,success );
     	}   
});