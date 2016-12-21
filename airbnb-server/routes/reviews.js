var Listing = require('../models/listing');
var UserProfile = require('../models/userProfile');
var mysql = require('../db/mysql');

function reviewUser(req, callback){
	console.log("I am in the reviewByHost" + req.userEmail);
	UserProfile.update({'email': req.userEmail},{$push :{"reviewForMe": {"feedback": req.feedback,"userReview":true, "ratings": req.rate, "hostEmail": req.hostEmail,"hostName":req.hostName ,"hostProfilePic": req.hostProfilePic,"listingTitle":req.listingTitle}}}, function(err, results){
		if(err){
			throw err;
		}else{
			if(results != ''){
				var completedTrips = "update trips set hostReview = 'true' where hostEmail = '"+req.hostEmail+"'  and listId ='"+req.listId+"'";
			    mysql.getData(function(err,res){
			        if(err){
			            console.log("Error in Trips MySQL:"+err);
			            //throw err;
			        }
			        else
			        {
                        console.log("ins ql before",res);
			            if(res!=''){
			            	console.log("ins ql if");
			            	UserProfile.update({'email': req.hostEmail},{$push :{"reviewByMe": {"feedback": req.feedback,"userReview":true, "ratings": req.rate, "userEmail": req.userEmail,"userName":req.userName ,"userProfilePic": req.userProfilePic,"listingTitle":req.listingTitle}}}, function(err, result){
								if(err){
									throw err;
								}else{
									if(result != ''){

                                        callback(null, {'code':'200'});

									}else{
										callback(null, {'code':'400'});
									}
								}
							});
			            }
			            else
			            {
			                callback(null, {'code': '400'});
			            }
			        }
			    },completedTrips);
			}else{
				callback(null, {'code':'400'});
			}
		}
	});    		
}

function reviewList(req, callback){
	console.log("I am in the editProfile" + req.listId);

	Listing.findOne({"listId":req.listId},function(err,result){

		if(result !='')
		{
			var overallRating;
			if(result.review.length>1) {
                if (result.overallRating) {
                    overallRating = Math.ceil(((result.overallRating) * (result.review.length) + req.rate.overall) / (result.review.length + 1));
                }
                else
				{
                    overallRating = Math.ceil(((1) * (result.review.length) + req.rate.overall) / (result.review.length + 1));
				}


                console.log("overall rating in if",overallRating);
			}
			else
			{
				overallRating= req.rate.overall;
                console.log("overall rating in else",overallRating);
			}

            Listing.update({"listId": req.listId},{"overAllRating":overallRating,$push: { "review": {"feedback": req.feedback, "ratings": req.rate, "userName":req.userName, "userEmail": req.userEmail, "profilePic": req.userProfilePic,"listReviewImages":req.listReviewImages}}}, function(err, result){
                if(err){
                    throw err;
                }else{
                    console.log("result");
                    if(result != ''){
                        UserProfile.update({'email': req.userEmail},{$push: {"reviewByMe":{"feedback": req.feedback, "ratings": req.rate, "listId": req.listId,"propertyReview":true,"listingTitle":req.listingTitle,"hostName":req.hostName,"hostProfilePic":req.hostProfilePic,"listReviewImages":req.listReviewImages}}}, function(err, results){
                            if(err){
                                throw err;
                            }else{
                                if(results != ''){
                                    var completedTrips = "update trips set userReview = 'true' where userEmail = '"+req.userEmail+"' and listId ='"+req.listId+"'";
                                    mysql.getData(function(err,res){
                                        if(err){
                                            console.log("Error in Trips MySQL:"+err);
                                            //throw err;
                                        }
                                        else
                                        {
                                            if(res != ''){


                                                UserProfile.update({'email':req.hostEmail},{$push: {"reviewForMe":{"feedback": req.feedback, "ratings": req.rate, "listId": req.listId,"propertyReview":true,"listingTitle":req.listingTitle,"userName":req.userName,"userProfilePic":req.userProfilePic,"listReviewImages":req.listReviewImages}}},function(err,results){


                                                    if(err)
                                                        throw err;
                                                    else
                                                    {
                                                        if(results!='')
                                                        {

                                                            console.log("Results: " + res);
                                                            callback(null, {'code':'200'});
                                                        }
                                                        else {

                                                            callback(null, {'code': '400'});
                                                        }

                                                    }


                                                });

                                            }
                                            else
                                            {
                                                callback(null, {'code': '400'});
                                            }
                                        }
                                    },completedTrips);
                                }else{
                                    callback(null, {'code':'400'});
                                }
                            }
                        });
                    }else{
                        callback(null, {'code':'400'});
                    }
                }
            });

		}

	});

}

function getListReviews(req, callback){
	console.log("I am in the getReviews " + req.listId);
	Listing.findOne({"listId":req.listId}, function(err, result){
		if(err){
			throw err;
		}else{
			if(result != ''){

                callback(null, {'code':200, 'value':{'review':result.review}});
			}else{
				callback(null, {'code':'400'});
			}
		}
	});
}

function getReviews(req, callback){
    console.log("I am in the getReviews " + req.listId);
    UserProfile.findOne({"email":req.user}, function(err, result){
        if(err){
            throw err;
        }else{
            if(result != ''){

                callback(null, {'code':200, 'value':{'reviewByMe':result.reviewByMe,'reviewForMe':result.reviewForMe}});
            }else{
                callback(null, {'code':'400'});
            }
        }
    });
}

function completedTripsForHost(req, callback){
	var completedTrips = "select * from trips where  hostEmail = '"+req.loggedInEmail+"' AND hostReview = 'false'";
    mysql.getData(function(err,results){
        if(err){
            console.log("Error in Trips MySQL:"+err);
            //throw err;
        }
        else
        {
            if(results.length>0){
                console.log("Results: " + results);
                callback(null, {'code': '200', 'value': results});
            }
            else
            {
                callback(null, {'code': '400'});
            }
        }
    },completedTrips);
}

function completedTripsForUser(req, callback){
	var completedTrips = "select * from trips where  userEmail = '"+req.loggedInEmail+"' AND userReview = 'false'";
    mysql.getData(function(err,results){
        if(err){
            console.log("Error in Trips MySQL:"+err);
            //throw err;
        }
        else
        {
            if(results.length>0){
                console.log("Results: " + results);
                callback(null, {'code': '200', 'value': results});
            }
            else
            {
                callback(null, {'code': '400'});
            }
        }
    },completedTrips);
}

exports.reviewUser = reviewUser;
exports.reviewList = reviewList;
exports.getReviews = getReviews;
exports.getListReviews=getListReviews;
exports.completedTripsForHost = completedTripsForHost;
exports.completedTripsForUser = completedTripsForUser;