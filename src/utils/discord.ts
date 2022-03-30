import { Client, Guild, MessageEmbed, TextChannel, User as DiscordUser } from "discord.js";
import userModel from "@/models/users.model";
import { User } from "@/interfaces/users.interface";
import nodeCache from "./Cache";
import { ORIGIN, SUPPORT_LOG_CHANNEL_ID, SUPPORT_SERVER_ID } from "@/config";
import { logger } from "./logger";
import { Bot } from "@/interfaces/bots.interface";
import { Server } from "@/interfaces/servers.interface";


type LogType = "SUBMIT_SERVER" | "SUBMIT_BOT" | "ACCEPT_SERVER"| "DENY_SERVER" |"ADD_COMMENT" | "ACCEPT_BOT" | "DENY_BOT" | "REPORT_BOT";
export const client = new Client({intents: [32767]});


export const LogSend = async (type: LogType, user: User, message: string, owners?: string[], server?: Server, reason?: string, bot?: DiscordUser, botdata?: Bot) => {
    const supportGuild = client.guilds.cache.get(SUPPORT_SERVER_ID);
    const supportChannel = supportGuild.channels.cache.get(SUPPORT_LOG_CHANNEL_ID) as TextChannel;
    const logEmbed = new MessageEmbed()
        .setTitle(`[${type}] ${user.username}#${user.discriminator} (\`${user.id}\`)`)
        .setDescription(message)
    try {
        supportChannel.send({embeds: [logEmbed]});
    } catch(e) {
        logger.error(e);
    }
    if(type === "ACCEPT_SERVER") {
        owners.forEach(async (owner) => {
            let ownerUser = client.users.cache.get(owner);
            if(!ownerUser) return;
            const ownerEmbed = new MessageEmbed()
                .setAuthor(`아카이브 서버 승인 알림`, client.user.avatarURL())
                .setTitle(`🎉 축하합니다!`)
                .setDescription(`
                - ${server.name} 서버가 아카이브에 승인되었습니다.
                - 아카이브에서 서버를 확인하시려면 [여기](${ORIGIN}/servers/${server.id})를 클릭하세요.
                `)
                .setColor("GREEN")
                .setTimestamp()
            try {
                ownerUser.send({embeds: [ownerEmbed]});
            } catch(e) {
                logger.error(e);
            }
        })
    }
    if(type === "DENY_SERVER") {
        owners.forEach(async (owner) => {
            let ownerUser = client.users.cache.get(owner);
            if(!ownerUser) return;
            const ownerEmbed = new MessageEmbed()
                .setAuthor(`아카이브 서버 거절 알림`, client.user.avatarURL())
                .setDescription(`
                - ${server.name} 서버가 아카이브에 거절되었습니다.
                > 거절사유
                \`\`\`${reason}\`\`\`
                `)
                .setColor("RED")
                .setTimestamp()
            try {
                ownerUser.send({embeds: [ownerEmbed]});
            } catch(e) {
                logger.error(e);
            }
        })
    }
    if(type === "SUBMIT_SERVER") {
        owners.forEach(async (owner) => {
            let ownerUser = client.users.cache.get(owner);
            if(!ownerUser) return;
            const ownerEmbed = new MessageEmbed()
                .setAuthor(`아카이브 서버 신청 알림`, client.user.avatarURL())
                .setDescription(`
                - ${server.name} 서버가 아카이브에 신청되었습니다.
                - 승인까지 최대 3일이 걸릴 수 있습니다
                `)
                .setColor("YELLOW")
                .setTimestamp()
            try {
                ownerUser.send({embeds: [ownerEmbed]});
            } catch(e) {
                logger.error(e);
            }
        })
    }
    if(type === "SUBMIT_BOT") {
        owners.forEach(async (owner) => {
            let ownerUser = client.users.cache.get(owner);
            if(!ownerUser) return;
            const ownerEmbed = new MessageEmbed()
                .setAuthor(`아카이브 봇 신청 알림`, client.user.avatarURL())
                .setDescription(`
                - ${bot.username}가 아카이브에 신청되었습니다.
                - 승인까지 최대 3일이 걸릴 수 있습니다
                `)
                .setColor("YELLOW")
                .setTimestamp()
            try {
                ownerUser.send({embeds: [ownerEmbed]});
            } catch(e) {
                logger.error(e);
            }
        })
    }
    if(type === "ACCEPT_BOT") {
        owners.forEach(async (owner) => {
            let ownerUser = client.users.cache.get(owner);
            if(!ownerUser) return;
            const ownerEmbed = new MessageEmbed()
                .setAuthor(`아카이브 봇 승인 알림`, client.user.avatarURL())
                .setTitle(`🎉 축하합니다!`)
                .setDescription(`
                - ${bot.username} 봇이 아카이브에 승인되었습니다.
                - 아카이브에서 봇을 확인하시려면 [여기](${ORIGIN}/bots/${bot.id})를 클릭하세요.
                `)
                .setColor("GREEN")
                .setTimestamp()
            try {
                ownerUser.send({embeds: [ownerEmbed]});
            } catch(e) {
                logger.error(e);
            }
        })
    }
    if(type === "DENY_BOT") {
        owners.forEach(async (owner) => {
            let ownerUser = client.users.cache.get(owner);
            if(!ownerUser) return;
            const ownerEmbed = new MessageEmbed()
                .setAuthor(`아카이브 봇 거절 알림`, client.user.avatarURL())
                .setDescription(`
                - ${bot.username} 봇이 아카이브에 거절되었습니다.
                > 거절사유
                \`\`\`${reason}\`\`\`
                `)
                .setColor("RED")
                .setTimestamp()
            try {
                ownerUser.send({embeds: [ownerEmbed]});
            } catch(e) {
                logger.error(e);
            }
        })
    }
    if(type === "REPORT_BOT") {
        let report_user = client.users.cache.get(user.id);
        if(!report_user) return;
        const ownerEmbed = new MessageEmbed()
                .setAuthor(`봇 신고 접수`, client.user.avatarURL())
                .setDescription(`${botdata.name}봇에 대한 신고가 접수되었습니다.`)
                .setColor("ORANGE")
                .setTimestamp()
        try {
            report_user.send({embeds: [ownerEmbed]});
        } catch(e) {
            logger.error(e);
        }
    }
}

export const getUser = async(id: string): Promise<User|null> => {
    const user = client.users.cache.get(id);
    if (!user) {
        let user = await userModel.findOne({id: id})
        if (!user) {
            return null;
        }
        return user
    } else {
        let cache = nodeCache.get(`users_${id}`)
        if(!cache) {
            await userModel.updateOne({id: id}, {username: user.username, avatar: user.avatar, discriminator: user.discriminator})
            nodeCache.set(`users_${id}`, user, 60 * 60 * 24)
        }
        return user.toJSON() as User
    }
}

export let fetchUser = async(id: string): Promise<DiscordUser|null> => {
    try {
        let user = await client.users.fetch(id)
        return user.toJSON() as DiscordUser
    } catch(e) {
        return null
    }
}