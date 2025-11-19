
<template>
	<transition name="fade">
		<div v-if="error" class="error-container" role="alertdialog" aria-modal="true" aria-labelledby="error-title" aria-describedby="error-desc">
			<div class="error-message">
				<h2 id="error-title">Error Occurred</h2>
				<p id="error-desc">{{ errorMessage }}</p>
				<slot name="details"></slot>
				<button @click="clearError" class="error-close" aria-label="Dismiss error">Dismiss</button>
			</div>
		</div>
	</transition>
</template>


<script>
export default {
	name: 'ErrorHandling',
	props: {
		error: {
			type: Boolean,
			default: false
		},
		errorMessage: {
			type: String,
			default: ''
		}
	},
	methods: {
		clearError() {
			this.$emit('clear-error');
		}
	}
}
</script>

<style src="./error_handlin.css"></style>
<style>
.fade-enter-active, .fade-leave-active {
	transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
	opacity: 0;
}
</style>
