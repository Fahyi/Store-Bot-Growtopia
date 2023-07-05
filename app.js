const {
    Client,
    IntentsBitField,
    Intents,
    EmbedBuilder, Attachment, AttachmentBuilder
} = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs")
const depo = require("./schemas/depo")
const User = require("./schemas/user");
const Stock = require("./schemas/stock");
const History = require("./schemas/history");
const dotenv = require("dotenv")

dotenv.config()

const prefix = ".";
let isMt = false

//connection-setup
const mongodbToken = process.env.MONGODB_TOKEN 
const discordToken = process.env.DISCORD_TOKEN

//roles
const roleAdmin = process.env.ROLE_ADMIN
const roleBuyyer = process.env.ROLE_BUYYER

//image
const banner = process.env.BANNER 
const emojiWL = process.env.EMOJI_WL
const emojiSad = process.env.EMOJI_NON_STOCK 
const emojiHappy = process.env.EMOJI_STOCK
const arrow = process.env.EMOJI_ARROW_STOCK

//channel-id
const idChannelTopUp = process.env.CHANNEL_ID_TOPUP
const buyyerHistoryChannel = process.env.CHANNEL_ID_HISTORY

mongoose
    .connect(mongodbToken)
    .then(() => console.log("connected to DB"))
    .catch((err) => console.log(err));

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on("guildMemberRemove", async (e) => {
    console.log(e)
    const exitPlayer = await User.deleteOne({userId: e.user.id});
    return console.log("deleted from DB")
});

client.on("messageCreate", async (e) => {
    if (e.content) return;
    if (idChannelTopUp === e.channelId) {
        const arg = e.embeds[0].data.description.split(":");
        const userGrowID = arg[1].split(" "); //const userItem = arg[2].trim().split(/(\d+)/);

        if (arg[2].includes("Lock")) {
            const findGrowID = await User.findOne({growID: String(userGrowID[1])});
            const newArg = arg[2].replace(/\s+/g, " ").trim().split(" ");
            switch (newArg[2]) {
                case "Lock":
                    if (!findGrowID) return;
                    const updateBalance = await User.findOne({
                        growID: String(userGrowID[1]),
                    });
                    const user = await client.users.fetch(updateBalance.userId);
                    switch (newArg[1]) {
                        case "World":
                            updateBalance.balance += Number(newArg[0]);
                            updateBalance.save();
                            const newBalanceWL = await User.findOne({
                                growID: String(userGrowID[1]),
                            });
                            user.send(
                                `Succsessfully Added **${newArg[0]} ${newArg[1]} ${newArg[2]}** ${emojiWL}\nNow your balance is **${updateBalance.balance}** ${emojiWL}`
                            );
                            break;
                        case "Diamond":
                            updateBalance.balance += Number(newArg[0]) * 100;
                            updateBalance.save();
                            user.send(
                                `Succsessfully Added **${newArg[0]} ${newArg[1]} ${newArg[2]}** ${emojiWL}\nNow your balance is **${updateBalance.balance}** ${emojiWL}`
                            );
                            break;
                        case "Gem":
                            updateBalance.balance += Number(newArg[0]) * 1000;
                            updateBalance.save();
                            user.send(
                                `Succsessfully Added **${newArg[0]} ${newArg[1]} ${newArg[2]}** ${emojiWL}\nNow your balance is **${updateBalance.balance}** ${emojiWL}`
                            );
                            break;
                    }
            }
        }
    }
});

client.on("messageCreate", async (e) => {
    if (e.author.bot) return
    async function command() {

        const roleAdded = new EmbedBuilder()

        const args = e.content
            .substring(prefix.length)
            .replace(/\s+/g, " ")
            .trim()
            .split(" ");

        const succsessTransaction = new EmbedBuilder()
            .setDescription(`Check your DM\n Dont forget to reps ^-^`)
            .setColor(0xa2ff86);

        const userInformation = new EmbedBuilder()

        const transcationSendToUser = new EmbedBuilder()
        //error
        const maintanace = new EmbedBuilder()
            .setTitle("Bot Offline")
            .setDescription("Sorry Not Available for a while...")
            .setColor(0xDCDCDC)

        const productCode = new EmbedBuilder()
            .setTitle(`Something Wrong`)
            .setDescription(`Please write Command correctly!`)
            .setColor(0xf7d060);

        const soldOut = new EmbedBuilder()
            .setTitle(`${args[1]} out Of Stock!`)
            .setDescription(`Sorry ${args[1]} Already Sold! Restocked soon..`)
            .setColor(0xff0202);

        const nameTaken = new EmbedBuilder()
            .setTitle("Error")
            .setDescription(`Name ${args[1]} Already taken! Choose another.`)
            .setColor(0xff0202);

        const commandError = new EmbedBuilder()
            .setTitle("Error")
            .setColor(0xff0202)
            .setDescription(`Command not found!`);

        const setError = new EmbedBuilder()
            .setColor(0xff0202)
            .setTitle("Error")
            .setDescription(".set <growid> first");

        const balanceMinus = new EmbedBuilder()
            .setColor(0xff0202)
            .setDescription(`You dont have enough Balance!`);

        if (e.content.startsWith(prefix)) {
            for (let i = 0; i < args.length; i++) {
                if (args[i].includes("/"))
                    return e.reply({embeds: [commandError]});
            }

            const userExist = await User.findOne({userId: e.author.id});
            switch (args[0]) {

                case "mt":
                    if (isMt === true) {
                        isMt = false
                        return e.reply("MT mode 🔴")
                    }
                    isMt = true
                    return e.reply("MT mode 🟢")

                    break

                case "changedepo":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args.length > 4 || args[3] === undefined) return e.reply({embeds: [commandError]})

                        async function worldDepo() {
                            const world = await depo.findOne({})

                            if (world) {
                                world.world = args[1].toUpperCase()
                                world.owner = args[2]
                                world.bot = args[3]
                                world.save()
                                return e.reply(`Succsess change Deposit Information`)
                            }

                            const newDepoWorld = new depo({
                                world: args[1].toUpperCase(),
                                owner: args[2],
                                bot: args[3]
                            })

                            newDepoWorld.save()
                            return e.reply(`Succsess change Deposit Information`)
                        }

                        return worldDepo()
                    }
                    break

                case "changedepo":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args.length > 4 || args[3] === undefined) return e.reply({embeds: [commandError]})

                        async function worldDepo() {
                            const world = await depo.findOne({})

                            if (world) {
                                world.world = args[1].toUpperCase()
                                world.owner = args[2]
                                world.bot = args[3]
                                world.save()
                                return e.reply(`Succsess change Deposit Information`)
                            }

                            const newDepoWorld = new depo({
                                world: args[1].toUpperCase(),
                                owner: args[2],
                                bot: args[3]
                            })

                            newDepoWorld.save()
                            return e.reply(`Succsess change Deposit Information`)
                        }

                        return worldDepo()
                    }
                    break

                case "changeprice":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args[2] === undefined || args.length > 3) return e.reply({embeds: [commandError]})

                        const isNumber = /^\d+$/.test(Number(args[2]));
                        if (!isNumber) return e.reply(`${args[2]} isnt number!`)

                        async function changeProductPrice(harga) {
                            const product = await Stock.findOne({type: args[1]})

                            if (!product) return e.reply("Product not found")

                            product.price = harga
                            product.save()

                            return e.reply(`Succsessfull change product Price into **${args[2]}** ${emojiWL}`)
                        }

                        return changeProductPrice(Number(args[2]))
                    }
                    break

                case "changename":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args[2] === undefined) return e.reply({embeds: [productCode]})

                        async function changeProductName(harga) {
                            const product = await Stock.findOne({type: args[1]})
                            const [one, two, ...restName] = args

                            if (!product) return e.reply("Product not found")

                            product.nameProduct = restName.join(" ")
                            product.save()

                            return e.reply(`Succsessfull change product name into **${restName.join(" ")}**`)
                        }

                        return changeProductName()
                    }
                    break

                case "addp":
                    console.log(e)
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args.length > 4 || args[3] === undefined) return e.reply({embeds: [productCode]})

                        const isNumber = /^\d+$/.test(Number(args[3]));
                        if (!isNumber) return e.reply(`${args[3]} isnt number!`)

                        async function addProduct(harga) {
                            const product = await Stock.findOne({type: args[2]})

                            if (product) return e.reply("Please use another unique code ")

                            const addNewProduct = new Stock({
                                nameProduct: args[1],
                                type: args[2],
                                price: harga
                            })

                            addNewProduct.save()
                            return e.reply(`Successfully add new product!\nName: ${args[1]}\nCode: ${args[2]}\nPrice: ${args[3]}`)
                        }

                        return addProduct(Number(args[3]))
                    }
                    break

                case "removep":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args.length > 2 || args[1] === undefined) return e.reply({embeds: [productCode]})

                        async function removeProduct(harga) {
                            const product = await Stock.findOneAndDelete({type: args[1]})

                            if (!product) return e.reply("Please input valid code ")

                            return e.reply(`Successfully delete product`)
                        }

                        return removeProduct()
                    }
                    break

                case "adds":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        await (async () => {
                            const addStock = await Stock.findOne({type: args[1]});

                            if (!addStock) return e.reply("Please input valid Code")

                            for (let i = 2; i < args.length; i++) {
                                const splitted = args[i].split("\n");
                                for (let z = 0; z < splitted.length; z++) {
                                    addStock.product.push(splitted[z]);
                                }
                            }
                            addStock.save()
                            return e.reply(`Sucsessfully added Stock into **${args[1]}**`);

                        })();
                    } else return e.reply("nope");
                    break

                case "send":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args.length > 4 || args[3] === undefined) return e.reply({embeds: [commandError]})

                        const isNumber = /^\d+$/.test(Number(args[3]));
                        if (!isNumber) return e.reply(`${args[3]} isnt number!`)

                        async function sendStock() {
                            const findProduct = await Stock.findOne({type: args[2]})

                            if (!findProduct || findProduct.product.length === 0) return e.reply("Cannot find Stock")

                            const userExist = await User.findOne({userId: args[1].replace(/[<>\ @]/g, "")})

                            if (!userExist) return e.reply("User not found in Database!")

                            const splicced = findProduct.product.splice(0, Number(args[3]))
                            const user = await client.users.fetch(userExist.userId);
                            const final = `Here's your Order:\n\n${splicced.map(a => `${a}\n`).join("")}`

                            findProduct.save()

                            const files = fs.writeFileSync('./productInformation/result.txt', final, {flag: 'a+'}, (err) => console.error)
                            await user.send({
                                files: [{
                                    attachment: "./productInformation/result.txt",
                                    name: "result.txt"
                                }]
                            })
                            fs.unlinkSync("./productInformation/result.txt")

                            const gift = new EmbedBuilder()
                                .setTitle(`Gift from ${e.author.username} :gift:`)
                                .setDescription(
                                    `You have Gifted ${findProduct.nameProduct}!`)
                                .setImage(banner)
                                .setColor(0x0099ff)

                            user.send({embeds: [gift]})
                            user.send(String(splicced))

                            e.reply((`Succsess sent to ${args[1]}`))
                        }

                        return sendStock()
                    }
                    break

                case "addbal":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args.length > 3 || args[2] === undefined) return e.reply({embeds: [commandError]})

                        async function sendBal() {
                            const userExist = await User.findOne({userId: args[1].replace(/[<>\ @]/g, "")})

                            if (!userExist) return e.reply("User not found in Database")

                            const isNumber = /^\d+$/.test(Number(args[2]));
                            if (!isNumber) return e.reply({embeds: [commandError]})

                            const isExist = userExist ? userExist.balance += Number(args[2]) : e.reply("User not found in Database!")

                            userExist.save()
                            return e.reply(`Succsessfully adding **${args[2]}** ${emojiWL} to **Balance** ${args[1]}`)
                        }

                        return sendBal()
                    }
                    break

                case "nuke":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args.length > 1) return e.reply({embeds: [commandError]})

                        async function modeNuke() {
                            const changeDepo = await depo.findOne({})
                            changeDepo.world = "NUKED!"
                            changeDepo.owner = "NUKED!"
                            changeDepo.bot = "NUKED!"

                            changeDepo.save()
                            return e.reply("Succsess change to mode Nuked")
                        }

                        return modeNuke()
                    }
                    break

                case "removebal":
                    if (e.member.roles.cache.has(roleAdmin)) {
                        if (args.length > 3 || args[2] === undefined) return e.reply({embeds: [commandError]})

                        async function removeBal() {
                            const userExist = await User.findOne({userId: args[1].replace(/[<>\ @]/g, "")})
                            const isNumber = /^\d+$/.test(Number(args[2]));

                            if (!isNumber) return e.reply({embeds: [commandError]})

                            if (!userExist) return e.reply("User not found in Database")

                            if (userExist.balance < Number(args[2])) {
                                userExist.balance = 0
                                userExist.save()
                                return e.reply(`Succsessfully removing **${args[2]}** ${emojiWL} from **Balance** ${args[1]}`)
                            }

                            userExist.balance -= Number(args[2])

                            userExist.save()
                            return e.reply(`Succsessfully removing **${args[2]}** ${emojiWL} from **Balance** ${args[1]}`)
                        }

                        return removeBal()
                    }
                    break

                case "help":
                    if (isMt === true) return e.reply({embeds: [maintanace]})
                    if (args.length > 1) return e.reply({embeds: [commandError]})

                    const help = new EmbedBuilder()
                        .setTitle(`BOT COMMANDS`)
                        .setDescription(
                            `.help\n.set <growId>\n.bal\n.depo\n.info\n.stock\n.buy <**CODE**> <ammount>\n`
                        )
                        .setColor(0x0099ff)
                        .setImage(banner);

                    return e.reply({embeds: [help]});
                    break

                case "info":
                    if (isMt === true) return e.reply({embeds: [maintanace]})
                    if (args.length > 1) return e.reply({embeds: [productCode]});

                    if (!userExist) return e.reply({embeds: [setError]});

                async function displayUserInformation() {
                    const findUser = await User.findOne({userId: e.author.id});
                    const {growID, balance} = findUser;
                    try {
                        userInformation
                            .setColor(0x0099ff)
                            .setTitle(`${e.author.username} Information`)
                            .setDescription(
                                `GrowID: ${growID}\nBalance: ${balance} ${emojiWL}`
                            );


                        return e.reply({embeds: [userInformation]});
                    } catch (err) {
                        console.error(err);
                    }
                }

                    return displayUserInformation();
                    break

                case "depo":
                    if (isMt === true) return e.reply({embeds: [maintanace]})
                    if (args.length > 1) return e.reply({embeds: [commandError]})

                    const depoWorld = await depo.findOne({})

                    if (depoWorld.length === 0 || !depoWorld) return

                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .addFields(
                            {name: "World:", value: depoWorld.world, inline: true},
                            {name: "Owner:", value: depoWorld.owner, inline: true},
                            {name: "Bot Name:", value: depoWorld.bot, inline: true},
                        )
                        .setImage(banner)
                        .setTimestamp()


                    return e.channel.send({embeds: [embed]});
                    break

                case "bal":
                    if (isMt === true) return e.reply({embeds: [maintanace]})
                    if (args.length > 1) return e.reply({embeds: [commandError]})
                    if (!userExist) return e.reply({embeds: [setError]});

                async function userBalance() {
                    const findUserBalance = await User.findOne({userId: e.author.id});
                    try {
                        const dataBalance = String(findUserBalance.balance);

                        const embed = new EmbedBuilder()
                            .setTitle(`Balance: ${dataBalance} ${emojiWL}`)
                            .setColor(0x0099ff);

                        return e.reply({embeds: [embed]});
                    } catch (err) {
                        console.log(err);
                    }
                }

                    return userBalance();
                    break

                case `set`:
                    if (isMt === true) return e.reply({embeds: [maintanace]})
                    if (args.length > 2) return e.reply({embeds: [commandError]})

                async function displayUser() {
                    const embed = new EmbedBuilder()
                        .setTitle(`Succsessfully`)
                        .setDescription(`Set GrowID to: ${args[1]}\nmake sure the upper or lower case is the same as your growid!`)
                        .setColor(0x5cff21);

                    const findUserGrowID = await User.findOne({
                        userId: e.author.id,
                    });

                    if (!args[1]) return e.reply({embeds: [productCode]});

                    const checkIfOtherUser = await User.find({growID: args[1]});
                    if (!findUserGrowID) {
                        if (checkIfOtherUser.length === 0) {
                            const CreateUser = new User({
                                userId: e.author.id,
                                growID: args[1],
                            });

                            CreateUser.save();
                            return e.reply({embeds: [embed]});
                        }
                    }

                    if (checkIfOtherUser.length > 0)
                        return e.reply({embeds: [nameTaken]});

                    if (findUserGrowID.growID !== args[1]) {
                        findUserGrowID.growID = args[1];
                        findUserGrowID.save();
                        return e.reply({embeds: [embed]});
                    }
                }

                    return displayUser();
                    break

                case "buy":
                    if (isMt === true) return e.reply({embeds: [maintanace]})
                    if (args.length > 3 || args[2] === undefined) return e.reply({embeds: [productCode]})

                    const isNumber = /^\d+$/.test(Number(args[2]));

                    if (!isNumber) return e.reply({embeds: [productCode]});
                    if (!userExist) return e.reply({embeds: [setError]})
                    if (parseInt(args[2]) <= 0)
                        return e.reply("Ammount Items must be above 1")

                async function penjumlahan(jumlah, idUser) {
                    const findUser = await User.findOne({userId: e.author.id});

                    if (!findUser || findUser.length === 0) return e.reply({embeds: [setError]});

                    const balanceCheck = findUser.balance;
                    const stockCheck = await Stock.findOne({type: args[1]});

                    if (!stockCheck || stockCheck.length === 0) return e.reply("Invalid product Code");
                    if (stockCheck.product.length < jumlah)
                        return e.reply({embeds: [soldOut]});

                    const hasilAkhir = jumlah * stockCheck.price;

                    if (balanceCheck < hasilAkhir)
                        return e.reply({embeds: [balanceMinus]});

                    const raw = stockCheck.product.splice(0, jumlah);
                    const final = `Here's your Order:\n\n${raw.map(a => `${a}\n`).join("")}`

                    stockCheck.save();

                    const user = await client.users.fetch(idUser);
                    const files = fs.writeFileSync('./productInformation/result.txt', final, {flag: 'a+'}, (err) => console.error)
                    await user.send({files: [{attachment: "./productInformation/result.txt", name: "result.txt"}]})
                    fs.unlinkSync("./productInformation/result.txt")


                    //sending to DM

                    await User.findOneAndUpdate(
                        {userId: findUser.userId},
                        {
                            $set: {
                                balance: findUser.balance - hasilAkhir,
                            },
                        },
                        {new: true}
                    );

                    async function embedProduk(title) {
                        const rolebyIdMessage = e.member.roles.cache.has(roleBuyyer);
                        const newStock = await Stock.findOne({type: args[1]})

                        if (!newStock) return

                        const dataHistory = {
                            buyyer: e.author.id,
                            product: `${title}`,
                            totalProduct: jumlah,
                            totalPrice: hasilAkhir,
                        };
                        const embed = new EmbedBuilder()
                            .setTitle(`Purchase ${newStock.nameProduct}`)
                            .setDescription(
                                `${arrow} Buyyer: <@${dataHistory.buyyer}>\n${arrow} Product Name : ${newStock.nameProduct}\n${arrow} Product Code : **${dataHistory.product}**\n${arrow} Ammount : ${jumlah}\n${arrow} Total Price : ${dataHistory.totalPrice} ${emojiWL}`
                            )
                            .setImage(banner)
                            .setTimestamp()
                            .setColor(0x0099ff);

                        const newHistory = new History(dataHistory);

                        newHistory.save();

                        client.channels.cache
                            .get(buyyerHistoryChannel)
                            .send({embeds: [embed]});

                        transcationSendToUser
                            .setTitle("Succsessfull Purchase")
                            .setDescription(
                                `You have purchased ${jumlah} ${newStock.nameProduct} for ${hasilAkhir} ${emojiWL}\nDon't forget to give reps, Thanks. New Stock: ${newStock.product.length} Left!`)
                            .addFields(
                                {name: "Name:", value: newStock.nameProduct, inline: true},
                                {name: "Message:", value: "Thank you!", inline: true},
                            )
                            .setImage(banner)
                            .setColor(0x0099ff)

                        succsessTransaction
                            .setTitle(`Transaction ${newStock.nameProduct} Succsessfull`)

                        if (!rolebyIdMessage) {
                            roleAdded
                                .setColor(0x0099ff)
                                .setTitle("New Role")
                                .setDescription(`${e.author.username} Welcome to <@&${roleBuyyer}>`)

                            await e.member.roles.add(roleBuyyer)

                            e.reply({embeds: [roleAdded]})
                        }

                        await user.send({embeds: [transcationSendToUser]})


                        return e.reply({embeds: [succsessTransaction]});
                    }

                    return embedProduk(stockCheck.type);
                }

                    return penjumlahan(Number(args[2]), e.author.id);
                    break

                case "stock":
                    if (isMt === true) return e.reply({embeds: [maintanace]})
                    if (args.length > 1 || args[0] === undefined) return e.reply({embeds: [productCode]})

                    const stock = await Stock.find();
                    const listProduct = new EmbedBuilder()
                        .setAuthor({name: e.author.username, iconURL: e.author.avatarURL()})
                        .setColor(0x0099ff)
                        .setTitle("LIST PRODUCTS")
                        .setImage(banner)
                        .setDescription(stock.length === 0 ? "Add your product using **.addp**" : String(stock.map(a => `\nName: ${a.nameProduct}\nCode: **${a.type}**\nStock: ${a.product.length} ${a.product.length === 0 ? emojiSad : emojiHappy}\nPrice: ${a.price} ${emojiWL}\n`).join("")))
                        .setFooter({text: "Requested by" + " " + e.author.username, iconURL: e.author.avatarURL()})
                        .setTimestamp();


                    return e.channel.send({embeds: [listProduct]});
                    break

                default:
                    commandError
                        .setDescription(`**.${args[0]}** Is not right Command, type **.help** for see  Command`)
                    return e.reply({embeds: [commandError]});
            }
        } else return
    }

    return command()
})

client.login(discordToken);