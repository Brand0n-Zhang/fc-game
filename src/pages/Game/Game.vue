<template>
    <div class="game-home">
        <header class="game-home-top">
            <span class="game-home-brand">Football Clash Cards</span>
        </header>

        <main class="game-home-main">
            <h1 class="game-home-title">足球卡牌对战</h1>
            <p class="game-home-subtitle">移动端 H5 · MVP Scaffold Ready</p>
        </main>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="less" scoped>
.game-home {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: 24px 20px;

    .game-home-top {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 44px;
    }

    .game-home-brand {
        font-size: 14px;
        letter-spacing: 1px;
        color: #94a3b8;
        text-transform: uppercase;
    }

    .game-home-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 12px;

        .game-home-title {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            color: #f8fafc;
        }

        .game-home-subtitle {
            margin: 0;
            font-size: 14px;
            color: #64748b;
        }
    }
}
</style>
