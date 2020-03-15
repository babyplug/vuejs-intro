var eventBus = new Vue();

Vue.component("product", {
  props: {
    premium: {
      type: Boolean,
      required: true
    },
    cart: {
      type: Number,
      required: true
    }
  },
  template: `
  <div class="product">

      <div class="product-image">
        <img :src="image" alt="">
      </div>

      <div class="product-info">
        <h1>{{ title }} </h1>
        <span v-if="onSale" style="color: red;">On Sale!</span>
        <p v-if="inStock" >In Stock {{quantity}}</p>
        <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
        <p>Shipping: {{ shipping }}</p>

        <product-detail :details="details"></product-detail>

        <h2>Size</h2>
        <ul>
          <li v-for="(s, i) in size" :key="i">{{ s }}</li>
        </ul>

        <h2>Colors</h2>
        <div v-for="(variant, index) in variants" 
          :key="variant.id"
          class="color-box"
          :style="{ backgroundColor: variant.color }"
          @mouseover="updateProduct(index)"
          >
        </div>

        <button 
          v-on:click="addTocart()" 
          :disabled="!inStock" 
          :class="{ disabledButton: !inStock}">
          Add to cart
        </button>
        <button 
          v-on:click="delFromCart()" 
          :disaled="toCartNumbers[selectedVariant] <= 0"
          :class="{ disabledButton: toCartNumbers[selectedVariant] <= 0 }"
        >
          Remove from cart
        </button>

      </div>

      <product-tabs :reviews="reviews"></product-tabs>

    </div>
  `,
  data() {
    return {
      product: "Socks",
      brand: "Vue Mastery",
      selectedVariant: 0,
      link:
        "https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg",
      onSale: true,
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          id: 2234,
          color: "green",
          image: "./assets/vmSocks-green-onWhite.jpg",
          quantity: 10
        },
        {
          id: 2235,
          color: "blue",
          image: "./assets/vmSocks-blue-onWhite.jpg",
          quantity: 0
        }
      ],
      size: ["s", "m", "l", "xl", "Free Size"],
      reviews: [],
      toCartNumbers: [0, 0]
    };
  },
  methods: {
    addTocart() {
      this.$emit("add-to-cart", this.variants[this.selectedVariant].id);
      this.decStock();
    },
    updateProduct(index) {
      this.selectedVariant = index;
    },
    delFromCart() {
      this.$emit("del-from-cart", this.variants[this.selectedVariant].id);
      // this.cart = this.cart > 0 ? this.cart - 1 : 0;
      this.incStock();
    },
    decStock() {
      this.variants[this.selectedVariant].quantity =
        this.variants[this.selectedVariant].quantity > 0
          ? this.variants[this.selectedVariant].quantity - 1
          : this.quantity;
      this.toCartNumbers[this.selectedVariant] += 1;
    },
    incStock() {
      if (this.toCartNumbers[this.selectedVariant] > 0) {
        this.toCartNumbers[this.selectedVariant] -= 1;
        this.variants[this.selectedVariant].quantity += 1;
      }
    }
  },
  computed: {
    title() {
      return `${this.brand} ${this.product}`;
    },
    image() {
      return this.variants[this.selectedVariant].image;
    },
    inStock() {
      return this.variants[this.selectedVariant].quantity;
    },
    quantity() {
      return this.variants[this.selectedVariant].quantity;
    },
    shipping() {
      // if (this.premium) return "Free";
      return this.premium ? "Free" : "2.99 $";
    }
  },
  mounted() {
    eventBus.$on("review-submitted", productReview => {
      this.reviews.push(productReview);
    });
  }
});

Vue.component("product-detail", {
  props: {
    details: {
      type: [String]
    }
  },
  template: `
  <div>
    <h2>Detail</h2>
    <ul>
      <li v-for="(detail, index) in details" :key="index">{{ detail }}</li>
    </ul>
  </div>
  `
});

Vue.component("product-review", {
  template: `
  <form class="review-form" @submit.prevent="onSubmit">
    <p v-if="errors.length > 0">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="e in errors">{{ e }}</li>
      </ul>
    </p>

    <p>
      <label for="name">Name:</label>
      <input id="name" v-model="name" placeholder="name">
    </p>
    
    <p>
      <label for="review">Review:</label>      
      <textarea id="review" v-model="review"></textarea>
    </p>
    
    <p>
      <label for="rating">Rating:</label>
      <select id="rating" v-model.number="rating">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>
        
    <p>
      <label for="recommend">Would you recommend this product?</label><br>
      <input style="width: auto;" type="radio" value="yes" v-model="recommend">
      <label style="padding-right: 20px;" for="yes">Yes</label>
      <input style="width: auto;" type="radio" value="no" v-model="recommend">
      <label for="no">No</label>
      <br>
    </p>

    <p>
      <input type="submit" value="Submit">  
    </p>    

  </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      errors: [],
      recommend: null
    };
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating && this.recommend) {
        const productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
        };
        eventBus.$emit("review-submitted", productReview);
        this.name = null;
        this.review = null;
        this.rating = null;
        this.recommend = null;
        this.errors = [];
      } else {
        this.errors = [];
        if (!this.name) this.errors.push("Name required.");
        if (!this.review) this.errors.push("Review required.");
        if (!this.rating) this.errors.push("Rating required.");
        if (!this.recommend) this.errors.push("Recommend required.");
      }
    }
  }
});

Vue.component("product-tabs", {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
  <div>
    <span 
      class="tab" 
      :class="{activeTab: selectedTab === tab}"
      v-for="(tab, i) in tabs" 
      :key="i"
      @click="selectedTab = tab">
    {{tab}}
    </span>

    <div v-show="selectedTab === 'Reviews' ">
      <p v-if="reviews.length == 0">There are no review yet.</p>
      <ul>
        <li v-for="review in reviews" >
          <p>{{ review.name }}</p>
          <p>Rating: {{ review.rating }}</p>
          <p>{{ review.review }}</p>
          <p>Recommend: {{ review.recommend }}</p>
        </li>
      </ul>
    </div>

    <product-review v-show="selectedTab === 'Make a Review'" ></product-review>

  </div>
  `,
  data() {
    return {
      tabs: ["Reviews", "Make a Review"],
      selectedTab: "Reviews"
    };
  }
});

var app = new Vue({
  el: "#app",
  data: {
    premium: false,
    cart: []
  },
  methods: {
    updateCart(id) {
      // this.cart += 1;
      this.cart.push(id);
    },
    delFromCart(id) {
      this.cart.pop();
    }
  }
});
