<template>
  <button v-text="website" @click="_website"></button>
</template>

<script type="text/ecmascript-6">
export default {
  name: "v-website",
  props: {
    website: String,
    tags: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  computed: {
    tag() {
      return this.tags[0] || "";
    }
  },
  methods: {
    _website() {
      let {
        website,
        tag,
        $route: { params }
      } = this;
      let path = "/posts/" + website + "/";
      if (website === params.website) {
        if (params.tag) this.$router.push({ path });
        return;
      }
      if (tag) path += tag;
      this.$router.push({ path });
    }
  }
};
</script>
