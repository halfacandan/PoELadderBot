module.exports = {
    GetChannelIdAsync: async function (guild, channelName){
        
        if(guild == null || channelName == null) return "**#" + channelName + "**";
        
        let channel = await guild.channels.cache.find(channel => channel.name === channelName);

        return (typeof channel === "undefined" ? "**#" + channelName + "**" : channel.toString());
    }
}