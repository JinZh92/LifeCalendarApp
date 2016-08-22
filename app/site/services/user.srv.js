(function(){
	'use strict'

	angular
		.module('lifeCalendarApp')
		.service('UserSrv', UserSrv);

	function UserSrv($state, $http, jwtHelper) {
		var self = this;

		// Function declaration
		self.getEmailFromToken = getEmailFromToken;
		self.getAllUserData = getAllUserData;
		self.getUserFromEmail = getUserFromEmail;
		self.changePassword = changePassword;
		self.updateUser = updateUser;
		self.createEvent = createEvent;
		self.getUserEvents = getUserEvents;
		self.updateEvent = updateEvent;
		self.updateEvents = updateEvents; // Update the myEvents in this service AFTER database has been updated.
		self.getUserSkills = getUserSkills;
		self.createSkill = createSkill;
		self.updateSkill = updateSkill;
		self.updateSkills = updateSkills;

		self.getThisWeek = getThisWeek;
		self.getWeeks=getWeeks;
		self.Coordiante=Coordiante;

		// Variable declaration
		self.myEmail;
		self.myUser;
		self.myEvents = []; // this is an array of event objects AFTER data has been returned.
		self.mySkills = []; // same as above but skills

		//------------Decode email from authToken-------//
		function getEmailFromToken(){
			var decrypt_token = jwtHelper.decodeToken(localStorage.authToken);
			self.myEmail = decrypt_token.userEmail;
		}

		//-------------This week and overview-----------//
		function getThisWeek(){
			var time_now = new Date(Date.now());
			var bd = new Date(self.myUser.userBirthday);
			return Math.ceil((time_now - bd)/(1000*3600*24*7))
		}

		function Coordiante(x,y,z){
			this.X=x;
			this.Y=y;
			this.Z=z;
		}

		function getWeeks(){
			self.array=[];
			var z=1;
			for(var j=0; j<=51; j++){
				var x=j*13;
				for (var i = 0 ; i <= 12; i++) {
					var y =i*13;
					var arr= new Coordiante(x,y,z);
					self.array.push(arr);
					z++;
				}
			}
			return self.array;	
		};

		//-------------Users Model--------------//
		function getAllUserData(){
			return $http.get('/api/users')
				.then(function(data){
					console.log('Get all users data service', data);
					return data.data.users;
				}, function (err){
					return err;
				})
		}

		function getUserFromEmail(){
			return $http.get('api/users/' + self.myEmail)
				.then(function(data){
					console.log("Get user from email " + self.myEmail, data);
					self.myUser = data.data.user;
					return data.data.user;
				})
		}

		function changePassword(email, __user){
			__user = JSON.stringify(__user);
			return $http.put('api/users/changePassword/' + email, __user)
				.then(function(data){
					console.log("updated user with email:" + email, data);
					if (res.status == 200){
						// event was updated successfully
						self.updateEvents(email, __user);
					}
				})
			// reload the page when user information has been updated.
			$state.go($state.$current, null, {reload: true})
		}

		function updateUser(email, __user){
			__user = JSON.stringify(__user);
			return $http.put('api/users/update/' + email, __user)
				.then(function(data){
					console.log("updated user with email:" + email, data);
					if (res.status == 200){
						// event was updated successfully
						self.updateEvents(email, __user);
					}
				})
			// reload the page when user information has been updated.
			$state.go($state.$current, null, {reload: true})
		}

		//-------------Events Model------------//
		function getUserEvents(){
			return $http.get('api/events/' + self.myEmail)
				.then(function(data){
					console.log('User events: ', data.data.events);
					console.log("type of date: ", typeof(data.data.events[0].eventStart));
					self.myEvents = data.data.events;
					return data.data.events;
				})
		}

		function updateEvent(id, __event){
			__event = JSON.stringify(__event);
			return $http.put('api/events/update/' + id, __event)
				.then(function(data){
					console.log("updated event with id:" + id, data);
					if (res.status == 200){
						// event was updated successfully
						self.updateEvents(id, __event);
					}
				})
		}

		function updateEvents(id, __event){ 
		// this function is called by the function above, to update myEvents in this service
		// it updates the one from self.myEvents that has id:id with __event
			for (var i=0; i<self.myEvents.length; i++){
				if (self.myEvents[i].id == id){
					self.myEvents[i].eventTitle = __event.eventTitle;
					self.myEvents[i].eventDescription = __event.eventDescription;
					self.myEvents[i].eventStart = __event.eventStart;
					self.myEvents[i].eventExpectedEnd = __event.eventExpectedEnd;
					self.myEvents[i].eventActualEnd = __event.eventActualEnd;
					self.myEvents[i].eventHasSkills = __event.eventHasSkills;
					self.myEvents[i].eventStatus = __event.eventStatus;
				}
			}
		}

		function createEvent(event){

			event = JSON.stringify(event);
			$http.post('/api/events/create',event)
				.then(function(res){
					//do something when event post request is successful
					console.log("Created event from controller");
				})
		}
		
		//---------------Skills Model-------------//
		function getUserSkills(){
			return $http.get('api/skills/' + self.myEmail)
				.then(function(data){
					console.log('User Skills: ', data.data.skills);
					self.mySkills = data.data.skills;
					return data.data.skills;
				})
		}

		function createSkill(skill){
			// how to make sure that user doesnt break the db if they enters a "'" or something
			// TODO: think about sql injection attack and the way to prevent it
			skill = JSON.stringify(skill);
			$http.post('api/skills/create', skill)
				.then(function(res){
					console.log('successfully created a skill')
				}, function(err){
					console.log('oops, something went wrong')
				})
		}

		function updateSkill(id, __skill){
			__skill = JSON.stringify(__skill);
			return $http.put('api/skills/update/' + id, __event)
				.then(function(data){
					console.log("updated event with id:" + id, data);
					if (res.status == 200){
						// event was updated successfully
						self.updateSkills(id, __event);
					}
				})

		}

		function updateSkills(id, __skill){
			for (var i=0; i<self.mySkills.length; i++){
				if (self.mySkills[i].id == id){
					self.mySkills[i].skillName = __skill.skillName;
					self.mySkills[i].tokensTotal = __skill.tokensTotal;
					self.mySkills[i].skillLevel = __skill.skillLevel;
					self.mySkills[i].levelUpDate = __skill.levelUpDate;									}
			}
		}
	}

})();