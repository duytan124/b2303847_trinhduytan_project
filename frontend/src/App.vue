<script setup>
import { Notivue, Notification, NotificationProgress, NotivueSwipe } from 'notivue';
</script>

<template>
    <Notivue v-slot="item">
        <NotivueSwipe :item="item">
            <Notification :item="item">
                <NotificationProgress :item="item" />
            </Notification>
        </NotivueSwipe>
    </Notivue>

    <RouterView></RouterView>
</template>