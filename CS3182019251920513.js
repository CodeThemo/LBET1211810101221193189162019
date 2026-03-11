document.addEventListener("DOMContentLoaded",function(){let scrollYBeforeOpen=0;let bodyScrollLocked=!1;function activateCartPanel(){const cartProducts=document.getElementById("CartProducts");const overlay=document.getElementById("Overlay");if(cartProducts&&overlay&&!bodyScrollLocked){scrollYBeforeOpen=window.scrollY||document.documentElement.scrollTop||0;cartProducts.classList.add("active");overlay.classList.add("active");document.body.style.position='fixed';document.body.style.top=`-${scrollYBeforeOpen}px`;document.body.style.width='100%';bodyScrollLocked=!0;const wishlistProducts=document.querySelector("#WishlistProducts");if(wishlistProducts)wishlistProducts.classList.remove("active");}}
function closeCartPanel(){const cartProducts=document.getElementById("CartProducts");const overlay=document.getElementById("Overlay");if(cartProducts)cartProducts.classList.remove("active");if(overlay)overlay.classList.remove("active");if(bodyScrollLocked){document.body.style.position='';document.body.style.top='';document.body.style.width='';document.body.style.overflowY='';const targetScroll=scrollYBeforeOpen;setTimeout(()=>{window.scrollTo({top:targetScroll,left:0,behavior:'instant'})},20);bodyScrollLocked=!1}}
function getCurrencySymbol(){let symbol="";const currencyLinks=document.querySelectorAll("#theme-settings li a[href]");currencyLinks.forEach(link=>{if(link.textContent.trim().toLowerCase()==="currency"){const val=link.getAttribute("href").trim();if(val)symbol=val}});if(!symbol){const cDiv=document.querySelector("div.priceCurrency");symbol=cDiv?cDiv.textContent.trim():""}
return symbol}
function formatPrice(num){const currency=getCurrencySymbol();return currency+" "+num.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:20})}
function parsePrice(str){return parseFloat((str||"").replace(/[^0-9.,-]/g,"").replace(/,/g,""))||0}
const cart={items:[],addItem:function(product){try{const variantKey=product.variant?JSON.stringify(product.variant):"";const existingIndex=this.items.findIndex((item)=>item.id===product.id&&item.variantKey===variantKey);if(existingIndex>=0){this.items[existingIndex].quantity++}else{this.items.push({...product,variantKey:variantKey,quantity:1})}
this.save();this.updateUI();if(!window.isBuyNowFlow&&!window.location.pathname.includes("/p/cart.html")){activateCartPanel()}
return!0}catch(e){console.error("Error adding to cart:",e);return!1}},removeItem:function(index){this.items.splice(index,1);this.save();this.updateUI()},updateQuantity:function(index,change){const newQty=this.items[index].quantity+change;if(newQty>0&&newQty<=100){this.items[index].quantity=newQty}else if(newQty<1){this.removeItem(index)}else{this.items[index].quantity=100}
this.save();this.updateUI();if(change>0)activateCartPanel();},save:function(){localStorage.setItem("simpleCart",JSON.stringify(this.items))},load:function(){try{const saved=localStorage.getItem("simpleCart");this.items=saved?JSON.parse(saved):[];this.updateUI()}catch(e){console.error("Error loading cart:",e);this.items=[]}},calculateTotal:function(){return this.items.reduce((total,item)=>{const price=parsePrice(item.currentPrice);return total+price*item.quantity},0)},updateUI:function(){try{this.updateOffCanvasCart();this.updateCartPage()}catch(e){console.error("Error updating cart UI:",e)}},updateOffCanvasCart:function(){const cartMenu=document.getElementById("CartMenu");if(!cartMenu)return;const container=cartMenu.querySelector(".cart-items")||document.createElement("div");container.className="cart-items";const cartCount=cartMenu.querySelector(".cart-count");const cartProducts=cartMenu.querySelector("#CartProducts");const panelButtons=cartProducts?.querySelector(".panel-buttons");let totalAmountElement=cartProducts?.querySelector(".total-amount .total-value");if(!totalAmountElement&&cartProducts){totalAmountElement=this.createTotalAmountElement()}
const totalItems=this.items.reduce((sum,item)=>sum+item.quantity,0);if(cartCount)cartCount.textContent=totalItems;container.innerHTML="";if(this.items.length>0){const emptyState=cartProducts.querySelector(".empty-state");if(emptyState)emptyState.remove();if(!container.parentNode&&cartProducts){cartProducts.insertBefore(container,panelButtons)}
this.items.forEach((item,index)=>{const itemElement=document.createElement("div");itemElement.className="cart-item";let variantText="";if(item.variant&&typeof item.variant==="object"){variantText=Object.values(item.variant).filter(val=>val&&val!=="undefined").join(" / ")}
itemElement.innerHTML=`
                        <img src="${item.image || "https://via.placeholder.com/70?text=No+Image"}" loading="lazy" alt="${item.title}">
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.title || "Untitled Product"}</div>
                            ${variantText ? `<div class="cart-item-variant">${variantText}</div>` : ""}
                            <div class="cart-item-price" itemscope itemtype="https://schema.org/Offer">
                                <span class="current-price" itemprop="price">${formatPrice(parsePrice(item.currentPrice))}</span>
                                <meta itemprop="priceCurrency" content="${getCurrencySymbol()}">
                                ${item.oldPrice ? `<span class="old-price">${formatPrice(parsePrice(item.oldPrice))}</span>` : ""}
                            </div>
                            <div class="cart-item-actions">
                                <div class="Layra-quantity-selector">
                                    <button class="quantity-btn qty-minus" data-index="${index}">−</button>
                                    <label for="pp-quantity-${index}" class="sr-only">Quantity</label>
                                    <input id="pp-quantity-${index}"
                                           class="quantity-input qty-display"
                                           name="product-quantity"
                                           type="text"
                                           value="${item.quantity}"
                                           min="1" max="100"
                                           data-index="${index}"
                                           readonly>
                                    <button class="quantity-btn qty-plus" data-index="${index}">+</button>
                                </div>
                                <button class="remove-btn" data-index="${index}">×</button>
                            </div>
                        </div>
                    `;container.appendChild(itemElement)});const total=this.calculateTotal();if(totalAmountElement){totalAmountElement.textContent=formatPrice(total);totalAmountElement.style.display="block"}}else{const emptyState=cartProducts.querySelector(".empty-state");if(!emptyState&&cartProducts){const newEmptyState=document.createElement("div");newEmptyState.className="empty-state";newEmptyState.innerHTML=`
                        <i class="bi bi-bag-x"></i>
                        <p>Your cart is currently empty</p>
                    `;cartProducts.insertBefore(newEmptyState,panelButtons)}
if(totalAmountElement)totalAmountElement.style.display="none"}},updateCartPage:function(){if(!document.getElementById("CartPage"))return;try{const cartPage=document.getElementById("CartPageItems");const cartSummary=document.getElementById("CartSummary");const cartSubtotal=document.getElementById("CartSubtotal");const cartTotal=document.getElementById("CartTotal");const totalItems=this.items.reduce((sum,item)=>sum+item.quantity,0);if(cartSummary){cartSummary.textContent=totalItems>0?`${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart`:"Your cart is empty"}
cartPage.innerHTML="";if(this.items.length>0){this.items.forEach((item,index)=>{let variantText="";if(item.variant&&typeof item.variant==="object"){variantText=Object.values(item.variant).filter(val=>val&&val!=="undefined").join(" / ")}
const itemElement=document.createElement("div");itemElement.className="cart-item-card";itemElement.innerHTML=`
                            <img src="${item.image || "https://via.placeholder.com/100?text=No+Image"}" alt="${item.title}" class="cart-item-image" loading="lazy">
                            <div class="cart-item-details">
                                <h3 class="cart-item-title">${item.title || "Untitled Product"}</h3>
                                ${variantText ? `<div class="cart-item-variant">${variantText}</div>` : ""}
                                <div class="cart-item-price" itemscope itemtype="https://schema.org/Offer">
                                    <span class="current-price" itemprop="price">${formatPrice(parsePrice(item.currentPrice))}</span>
                                    <meta itemprop="priceCurrency" content="${getCurrencySymbol()}">
                                    ${item.oldPrice ? `<span class="old-price">${formatPrice(parsePrice(item.oldPrice))}</span>` : ""}
                                </div>
                                <div class="cart-item-actions">
                                    <div class="Layra-quantity-selector">
                                        <button class="quantity-btn qty-minus" data-index="${index}">−</button>
                                        <label for="cart-quantity-${index}" class="sr-only">Quantity</label>
                                        <input id="cart-quantity-${index}"
                                               class="quantity-input qty-display"
                                               name="product-quantity"
                                               type="text"
                                               value="${item.quantity}"
                                               min="1" max="100"
                                               data-index="${index}"
                                               readonly>
                                        <button class="quantity-btn qty-plus" data-index="${index}">+</button>
                                    </div>
                                </div>
                            </div>
                            <button class="remove-item-btn remove-btn" data-index="${index}">×</button>
                        `;cartPage.appendChild(itemElement)});const subtotal=this.calculateTotal();if(cartSubtotal)cartSubtotal.textContent=formatPrice(subtotal);if(cartTotal)cartTotal.textContent=formatPrice(subtotal);}else{const emptyMessage=document.createElement("div");emptyMessage.className="empty-cart-message";emptyMessage.innerHTML=`
                        <i class="bi bi-bag-x"></i>
                        <h3>Your cart is empty</h3>
                        <p>Looks like you haven't added anything to your cart yet</p>
                        <a href="/" class="continue-shopping-btn">Continue Shopping</a>
                    `;cartPage.appendChild(emptyMessage);if(cartSubtotal)cartSubtotal.textContent=formatPrice(0);if(cartTotal)cartTotal.textContent=formatPrice(0);}}catch(e){console.error("Error updating cart page:",e)}},createTotalAmountElement:function(){const cartProducts=document.querySelector("#CartProducts");const panelButtons=cartProducts.querySelector(".panel-buttons");const totalElement=document.createElement("div");totalElement.className="total-amount";totalElement.style.display="none";totalElement.innerHTML=`
                <div class="total-row">
                    <span class='subtotal'>Subtotal:</span>
                    <span class="total-value">${formatPrice(0)}</span>
                </div>
            `;cartProducts.insertBefore(totalElement,panelButtons);return totalElement.querySelector(".total-value")},};cart.load();window.addEventListener("storage",function(event){if(event.key==="simpleCart"){console.log("[Cart Sync] Detected change from another tab → reloading cart");cart.load()}});function handleQuantityChange(input,change){if(!input)return;let newQty=parseInt(input.value)+change;newQty=Math.max(1,Math.min(100,newQty));input.value=newQty}
document.addEventListener("click",function(e){if(e.target.classList.contains("quantity-btn")&&!e.target.hasAttribute("data-index")){const isMinus=e.target.classList.contains("qty-minus");const isPlus=e.target.classList.contains("qty-plus");const input=document.getElementById("product-qty");if(input&&(isMinus||isPlus)){handleQuantityChange(input,isMinus?-1:1)}}
const addToCartBtn=e.target.closest(".add-to-cart");if(addToCartBtn){e.preventDefault();try{const postId=addToCartBtn.getAttribute("data-id")||"missing-id";const postTitle=addToCartBtn.getAttribute("data-title")||"Untitled Product";const quantity=parseInt(document.getElementById("product-qty")?.value)||1;const productContainer=addToCartBtn.closest(".post-outer")||addToCartBtn.closest(".post")||document;let currentPrice=productContainer.querySelector(".Layra-product-current-price")?.textContent?.trim()||productContainer.querySelector("[data-Layra-product-current-price]")?.textContent?.trim()||productContainer.querySelector(".current-price")?.textContent?.trim()||"0";let oldPrice=productContainer.querySelector(".Layra-product-old-price")?.textContent?.trim()||productContainer.querySelector(".old-price")?.textContent?.trim()||"";let variant={};const groups=productContainer.querySelector(".Layra-variant-group.group");if(groups){const groupName=groups.closest(".Layra-product-variants")?.querySelector("strong")?.textContent?.replace(":","").trim()||"Option";let selected=groups.querySelector(".selected")||groups.querySelector('span[aria-pressed="true"]')||groups.querySelector("span.active");if(!selected)selected=groups.querySelector("span[data-label], span");if(selected){variant[groupName]=selected.getAttribute("data-label")||selected.textContent?.trim()||"selected"}}
let image="";const thumbnailWrapper=productContainer.querySelector(".Layra-image-wrapper");if(thumbnailWrapper){const thumbImg=thumbnailWrapper.querySelector(".post-thumbnail");if(thumbImg?.src)image=thumbImg.src}
if(!image){const sliderWrapper=productContainer.querySelector(".Layra-fullpage-slider")||productContainer.querySelector(".swiper-container");if(sliderWrapper){const activeImg=sliderWrapper.querySelector(".swiper-slide-active img")||sliderWrapper.querySelector(".swiper-slide-visible img")||sliderWrapper.querySelector('img:not([style*="display: none"])');const firstImg=sliderWrapper.querySelector("img");image=(activeImg||firstImg)?.src||""}}
if(!image)image="https://via.placeholder.com/300?text=No+Image";for(let i=0;i<quantity;i++){cart.addItem({id:postId,title:postTitle,image:image,currentPrice:currentPrice,oldPrice:oldPrice,variant:variant,})}
const originalHTML=addToCartBtn.innerHTML;addToCartBtn.innerHTML='<i class="fas fa-check"></i> Added!';addToCartBtn.style.pointerEvents="none";setTimeout(()=>{addToCartBtn.innerHTML=originalHTML;addToCartBtn.style.pointerEvents=""},2000)}catch(error){console.error("Error adding to cart:",error)}}
if(e.target.classList.contains("quantity-btn")&&e.target.hasAttribute("data-index")){const index=parseInt(e.target.getAttribute("data-index"));const change=e.target.classList.contains("qty-minus")?-1:1;cart.updateQuantity(index,change)}
if(e.target.classList.contains("remove-btn")||e.target.classList.contains("remove-item-btn")){const index=parseInt(e.target.getAttribute("data-index"));cart.removeItem(index)}});const cartMenu=document.getElementById("CartMenu");if(cartMenu){const cartIcon=cartMenu.querySelector(".cart-icon");const cartProducts=cartMenu.querySelector("#CartProducts");const overlay=document.getElementById("Overlay");cartIcon?.addEventListener("click",function(e){e.stopPropagation();if(!window.location.pathname.includes("/p/cart.html")){activateCartPanel()}});const cartClose=cartProducts?.querySelector(".close-panel");cartClose?.addEventListener("click",function(){closeCartPanel()})}
const overlay=document.getElementById("Overlay");overlay?.addEventListener("click",function(){document.querySelectorAll("#WishlistProducts, #CartProducts").forEach(panel=>{panel.classList.remove("active")});overlay.classList.remove("active");closeCartPanel()});document.addEventListener("click",function(e){if(e.target.classList.contains("notcheckout")||e.target.id==="HavingNotCheckoutpage"){e.preventDefault();if(cart.items.length>0){alert("Proceeding to checkout with "+cart.items.reduce((sum,item)=>sum+item.quantity,0)+" items")}else{alert("Your cart is empty")}}
if(e.target.classList.contains("view-cart")){e.preventDefault();window.location.href="/p/cart.html"}});const cartPage=document.getElementById("CartPage");if(cartPage){const isCartPage=window.location.pathname.includes("/p/cart.html");cartPage.style.display=isCartPage?"block":"none"}});document.addEventListener("DOMContentLoaded",function(){document.addEventListener("click",function(e){const buyNowBtn=e.target.closest(".direct-buy");if(!buyNowBtn)return;e.preventDefault();window.isBuyNowFlow=!0;const productContainer=buyNowBtn.closest(".post-outer")||buyNowBtn.closest(".post")||document;let addToCartBtn=productContainer.querySelector(".add-to-cart");if(addToCartBtn){try{addToCartBtn.dispatchEvent(new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window,}))}catch(err){try{addToCartBtn.click()}catch(e){}}
setTimeout(()=>{window.location.href="/p/checkout.html";window.isBuyNowFlow=!1},100);return}})})
