import { tweetsData } from  "./data.js";
const cachedData = localStorage.getItem("liveData");
const liveData = cachedData ? JSON.parse(cachedData) : tweetsData;

import { v4 as uuidv4 } from 'https://jspm.dev/uuid';



// EVENT LISTENERS
document.addEventListener('click', function(e) {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like)
        }
    else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if (e.target.dataset.reply) {
        handleReplyClick(e.target.dataset.reply)
    }
    else if (e.target.id === "tweet-btn") {
        handleTweetBtnClick()
    } 
    else if (e.target.dataset.send)  {
        pushAReply(e.target.dataset.send)
    } 
})    

document.addEventListener('click', function(e) {
    if (e.target.dataset.reply) {
        ShowAddAReply(e.target.dataset.reply) 
    }
})

document.addEventListener('click', function(e) {
    if (e.target.id === "delete-btn") {
        deleteReply()
    }
})


// HANDLE LIKES, RETWEETS & REPLIES 
function handleLikeClick(tweetId) {
    const targetTweetObj = liveData.filter(function(tweet) {
      return tweet.uuid === tweetId
    })[0]
  
    if (targetTweetObj.isLiked) {
      targetTweetObj.likes--
    } else {
      targetTweetObj.likes++
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    updateLocalStorage(liveData)
    render()
}


function updateLocalStorage(liveData) {
    localStorage.setItem('liveData', JSON.stringify(liveData));
}


  function handleRetweetClick(tweetId) {
    const targetTweetObj = liveData.filter(function(tweet) {
      return tweet.uuid === tweetId
    })[0]
  
    if (targetTweetObj.isRetweeted) {
      targetTweetObj.retweets--
    } else {
      targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    updateLocalStorage(liveData)
    render()
}

function handleReplyClick(replyID) {
    document.getElementById(`replies-${replyID}`).classList.toggle('hidden')
    console.log(replyID)

}

function pushAReply(replyInputId) {
    const comment = document.getElementById(`reply-input-el-${replyInputId}`).value
    const tweet = liveData.find((t) => t.uuid === replyInputId);

    if (comment) {

        tweet.replies.unshift({
        
            handle: `@TheBigRig`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: comment,
            isDeleteable: true,
            uuid: uuidv4()
    });

    updateLocalStorage(liveData)
    render()
    }
}

function deleteReply() {
    const userComments = liveData.flatMap(function(tweet) {
        return tweet.replies.filter(function(reply) {
            return reply.isDeleteable === true;
        })
    });
    
    // Delete the first comment in the userComments array
    if (userComments.length > 0) {
        const commentIndex = 0;
        const comment = userComments[commentIndex];
        const tweetIndex = liveData.findIndex(tweet => tweet.replies.includes(comment));
        
        liveData[tweetIndex].replies.splice(commentIndex, 1);
    }

    updateLocalStorage(liveData);
    render();
}
  

function ShowAddAReply(replyInputId) {
    document.getElementById(`reply-input-${replyInputId}`).classList.toggle('hidden')

    



}

function handleTweetBtnClick() {
    const tweetInput = document.getElementById('tweet-input')
    if (tweetInput.value) {

        liveData.unshift ( {
        handle: `@TheBigRig`,
        profilePic: `images/scrimbalogo.png`,
        likes: 0,
        retweets: 0,
        tweetText: tweetInput.value ,
        replies: [                
        ],
        isLiked: false,
        isRetweeted: false,
        uuid: uuidv4()
    })
    tweetInput.value = ""
    render()
}

}


// CREATING THE POSTS
function getFeedHtml(){
    let feedHtml = ``
    
    liveData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                let deleteButtonHtml = ''
                if (reply.isDeleteable) {
                    deleteButtonHtml = `<button data-delete="${reply.uuid}" class="delete-button" id="delete-btn">Delete</button>`
                }
                repliesHtml+=`
            <div class="tweet-reply data-comment="${reply.uuid}">
                <div class="tweet-inner">
                    <img src="${reply.profilePic}" class="profile-pic">
                        <div data-comment-id="${reply.uuid}">
                            <p class="handle">${reply.handle}</p>
                            <p class="tweet-text">${reply.tweetText}</p>
                            <span>${deleteButtonHtml}</span>
                        </div>
                    </div>
            </div>
`
})


}
        
          
        feedHtml += `
        <div class="tweet">
            <div class="tweet-inner">
                <img src="${tweet.profilePic}" class="profile-pic">
                <div>
                    <p class="handle">${tweet.handle}</p>
                    <p class="tweet-text">${tweet.tweetText}</p>
                    <div class="tweet-details">
                        <span class="tweet-detail">
                            <i class="fa-regular fa-comment-dots"
                            data-reply="${tweet.uuid}"
                            ></i>
                            ${tweet.replies.length}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-heart ${likeIconClass}"
                            data-like="${tweet.uuid}"
                            ></i>
                            ${tweet.likes}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-retweet ${retweetIconClass}"
                            data-retweet="${tweet.uuid}"
                            ></i>
                            ${tweet.retweets}
                        </span>
                    </div>   
                </div>       
            </div>
            <div class="reply-container flex hidden" id="reply-input-${tweet.uuid}">
            <img src="images/scrimbalogo.png" class="profile-pic">
             <textarea class="reply-input" id="reply-input-el-${tweet.uuid}" placeholder="Reply to this tweet?" data-replying="${tweet.uuid}"></textarea>
            <i class="fa-sharp fa-solid fa-share" id="push-reply-icon" data-send="${tweet.uuid}"></i>           
            </div>  
            <div class="hidden" id="replies-${tweet.uuid}">
                ${repliesHtml}
            </div>   
        </div>
`

   })
   return feedHtml 
}

function render() {
    document.getElementById('feed').innerHTML = getFeedHtml()
}
render()

