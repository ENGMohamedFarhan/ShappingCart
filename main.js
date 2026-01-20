const cartCounter=document.querySelector(".cart_counter");
const cartDOM=document.querySelector(".cart__items");
const addToCatrBtn=document.querySelectorAll(".btn__add__to__cart");
const totalCount=document.querySelector("#total__counter");
const totalcost=document.querySelector(".total__cost");
const addTocatrBtn=document.querySelectorAll('.btn.check_out_btn');
const checkOutBtn = document.querySelector(".check_out_btn");
let paymentmethod=document.querySelectorAll("input[type=radio][name=payment__method]");
let selectedPaymentMethod=document.querySelector("input[type=radio][name=payment__method]:checked");
let phone=document.querySelector("#phone");
let paymentType='paypal';

let GLOBAL_VARIABLES = {
  "merchantUid": "",
  "apiUserId": "",
  "apiKey": ""
};

let cartItems=(JSON.parse(localStorage.getItem("cart__items"))||[]);
function loadData(){
   caculateTotal();
}

paymentmethod.forEach(pay=>{
   pay.addEventListener("change",(e)=>{
   if(pay.value === "evc"){
    phone.classList.add("active");
}else{
    phone.classList.remove("active");
}
   })
    
})
document.addEventListener("DOMContentLoaded",loadData);
checkOutBtn.addEventListener('click',()=>{
    if(paymentType === "paypal"){
        checkOutpaypal();
    }else{
        checkoutEvc();
    }
})
cartCounter.addEventListener('click',()=>{
    cartDOM.classList.toggle("active");
})
addToCatrBtn.forEach(btn=>{
    btn.addEventListener("click",()=>{
            let parentElement=btn.parentElement;
    const product={
        id:parentElement.querySelector('#product__id').value,
        name:parentElement.querySelector('.product__name').innerText,
        image:parentElement.querySelector('#image').getAttribute("src"),
        price:parentElement.querySelector('.product__price').innerText.replace("$",""),
        quantity:1
    }
    let isInCart=cartItems.filter(item => item.id === product.id).length >0;
    if(!isInCart){
        addItemToTheDOM(product);
    }else{
        alert("Product All ready in the Cart");
        return;
    }
    const cartDOMItems=document.querySelectorAll(".cart__item");
    cartDOMItems.forEach(individualItem=>{
        if(individualItem.querySelector("#product__id").value=== product.id){
            increaseItem(individualItem,product);
            decreaseItem(individualItem,product);
            removeItem(individualItem,product);

        }
    })
     cartItems.push(product)
     caculateTotal();
    
    })

})
function addItemToTheDOM(product){
    cartDOM.insertAdjacentHTML("afterbegin",`
           <div class="cart__item">
                        <input type="hidden" name="" id="product__id" value="${product.id}">
                        <img src="${product.image}" alt="" id="">
                        <h4 class="product__name">${product.name}</h4>
                        <a  class="btn__small" action="decrease">&minus;</a>
                        <h4 class="product__quantity">${product.quantity}</h4>
                        <a class="btn__small" action="increase">&plus;</a>
                        <span class="product__price">${product.price}</span>
                        <a  class="btn__small  btn__remove" action="remove">&times;</a>
                    </div>
        `)
}
function caculateTotal(){
    let total=0;
    cartItems.forEach(item=>{
        total+=item.quantity * item.price;
    });
    totalcost.innerText=total.toFixed(2);
    totalCount.innerText=cartItems.length;

}
function removeItem(individualItem,product){
    individualItem.querySelector("[action='remove']").addEventListener('click',()=>{
        cartItems.forEach(cartItem =>{
            if(cartItem.id === product.id){
                
                    cartItems=cartItems.filter(newElements=>newElements.id !== product.id
                    );
                    individualItem.remove();
                    caculateTotal();
                
                
                
            }
        })
    })
}
function decreaseItem(individualItem,product){
    individualItem.querySelector("[action='decrease']").addEventListener('click',()=>{
        cartItems.forEach(cartItem =>{
            if(cartItem.id === product.id){
                if(cartItem.quantity>1){
                   individualItem.querySelector(".product__quantity").innerText = -- cartItem.quantity;
                }else{
                    cartItems=cartItems.filter(newElements=>newElements.id !== product.id
                    );
                    individualItem.remove();
                }
                
                caculateTotal();
            }
        })
    })
}
function increaseItem(individualItem,product){
    individualItem.querySelector("[action='increase']").addEventListener('click',()=>{
        cartItems.forEach(cartItem =>{
            if(cartItem.id === product.id){
                individualItem.querySelector(".product__quantity").innerText = ++ cartItem.quantity;
                caculateTotal();
            }
        })
    })
}
function checkOutpaypal(){
    let checkoutForm=`
<form id="paypal__form"action="https://www.paypal.com/cgi-bin/webscr" method="post">
  
  <input type="hidden" name="cmd" value="_cart">
  <input type="hidden" name="upload" value="1">
  <input type="hidden" name="business" value="dugsiiyeonline@gmail.com">
`;
cartItems.forEach((item,index)=>{
    index++;
    checkoutForm+=`
  <input type="hidden" name="item_name_${index}" value="${item.name}">
  <input type="hidden" name="amount_${index}" value="${item.price}">
  <input type="hidden" name="quantity_${index}" value="${item.quantity}">


  
`;
});

checkoutForm +=`<input type="submit" value="PayPal Checkout">
</form>`;
document.body.insertAdjacentHTML("beforeend", checkoutForm);

document.querySelector("#paypal__form").submit();
}
async function checkoutEvc(){

    let data = {
  "schemaVersion": "1.0",
  "requestId": "101111003",
  "timestamp": "client_timestamp",
  "channelName": "WEB",
  "serviceName": "API_PURCHASE",
  "serviceParams": {
    "merchantUid": GLOBAL_VARIABLES.merchantUid,
    "apiUserId": GLOBAL_VARIABLES.apiUserId,
    "apiKey": GLOBAL_VARIABLES.apiKey,
    "paymentMethod": "mwallet_account",
    "payerInfo": {
      "accountNo": "252" + phone.value
    },
    "transactionInfo": {
      "referenceId": "1245",
      "invoiceId": "858585",
      "amount": totalcost.innerText,
      "currency":"USD",
      "description":"Test USD"

}
}
}
await fetch("https:///api.wait.com/asm",{
    method : "POST",
    headers:{
        "content-type":"application/json"
    },
    body:JSON.stringify(data),
})
.then(Response=>Response.json())
.then(data=>{
   if(data.ResponseMsg==="RCS_SUCCESS"){
     alert("Order was sent successfully");
   }else{
     alert(data.ResponseMsg);
     
   }
    
})
.catch((error)=>{
    console.log("err :", error);
    
})
}

