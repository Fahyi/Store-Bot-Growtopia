const {
  Client,
  IntentsBitField,
  Intents,
  EmbedBuilder, Attachment, AttachmentBuilder
} = require("discord.js");
const mongoose = require("mongoose");
const User = require("./schemas/user");
const Stock = require("./schemas/stock");
const History = require("./schemas/history");
const Suggest = require("./schemas/suggestion");
const fs = require("fs")
const buffer = require("buffer");

mongoose
  .connect(
    `mongodb://fahyins:221105230474@ac-gw41l0s-shard-00-00.x949qyu.mongodb.net:27017,ac-gw41l0s-shard-00-01.x949qyu.mongodb.net:27017,ac-gw41l0s-shard-00-02.x949qyu.mongodb.net:27017/?ssl=true&replicaSet=atlas-q7h3ls-shard-0&authSource=admin&retryWrites=true&w=majority`
  )
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
const prefix = ".";

//image
const banner = "https://share.creavite.co/3OItHy16dgXOY1oj.gif";
const emojiWL = "<:PngItem_1106058:1119289365764526139>";
const emojiSad = "<:kisspngemojithoughtdiscordsmiles>";
const emojiHappy = "<:8d6d1e4e94f24429b307fe144d9a4b7b>";
const stockChannel = "1121826209744048158";

const filePath = ""

//channel-id
const idChannelTopUp = "1121302930641920080";
const stockChannelId = "1121826209744048158";

client.on("guildMemberRemove", async (e) => {
  if (e) {
    const exitPlayer = await User.deleteOne({ userId: e.user.id });
    return exitPlayer.save();
  } else return;
});

client.add;

client.on("messageCreate", async (e) => {
  if (e.content) return;
  console.log(e);
  if (idChannelTopUp === e.channelId) {
    const arg = e.embeds[0].data.description.toLowerCase().split(":");
    const userGrowID = arg[1].split(" "); //const userItem = arg[2].trim().split(/(\d+)/);

    if (arg[2].includes("lock")) {
      const findGrowID = await User.findOne({ growID: String(userGrowID[1]) });
      const newArg = arg[2].replace(/\s+/g, " ").trim().split(" ");
      console.log(newArg);
      switch (newArg[2]) {
        case "lock":
          if (!findGrowID) return;
          const updateBalance = await User.findOne({
            growID: String(userGrowID[1]),
          });
          const user = await client.users.fetch(updateBalance.userId);
          switch (newArg[1]) {
            case "world":
              updateBalance.balance += Number(newArg[0]);
              updateBalance.save();
              const newBalanceWL = await User.findOne({
                growID: String(userGrowID[1]),
              });
              user.send(
                `Succsessfully Added **${newArg[0]} ${newArg[1]} ${newArg[2]}** ${emojiWL}\nNow your balance is **${newBalanceWL.balance}** ${emojiWL}`
              );
              break;
            case "diamond":
              updateBalance.balance += Number(newArg[0]) * 100;
              updateBalance.save();
              user.send(
                `Succsessfully Added **${newArg[0]} ${newArg[1]} ${newArg[2]}** ${emojiWL}\nNow your balance is **${newBalanceWL.balance}** ${emojiWL}`
              );
              break;
            case "gem":
              updateBalance.balance += Number(newArg[0]) * 1000;
              updateBalance.save();
              user.send(
                `Succsessfully Added **${newArg[0]} ${newArg[1]} ${newArg[2]}** ${emojiWL}\nNow your balance is **${newBalanceWL.balance}** ${emojiWL}`
              );
              break;
          }
      }
    }
  }
});

client.on("messageCreate", async (e) => {
  if(e.length > 1 ) return

  async function command() {
    console.log(e.mentions.users)
    const args = e.content
        .substring(prefix.length)
        .replace(/\s+/g, " ")
        .trim()
        .split(" ");
    //userGrowID[1] === GROW ID
    //${userItem[1]} === NOMINAL WL ATAU DL


    const succsessTransaction = new EmbedBuilder()
        .setTitle(`Transaction ${args[1]} Succsessull`)
        .setDescription(`Check your DM\n Dont forget to reps ^-^`)
        .setColor(0xa2ff86);

    const transcationSendToUser = new EmbedBuilder()

    const userInformation = new EmbedBuilder()
    //error
    const productCode = new EmbedBuilder()
        .setTitle(`Something Wrong`)
        .setDescription(`Please write Command correctly!`)
        .setColor(0xf7d060);

    const soldOut = new EmbedBuilder()
        .setTitle(`${args[1]} Of Stock!`)
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
        if (args[i].includes("." || "/"))
          return e.reply({ embeds: [commandError] });
        console.log(args[i]);
      }

      const userExist = await User.findOne({ userId: e.author.id });
      switch (args[0]) {
        case "adds":
          if (e.author.id === "870927334931316787") {
            await (async () => {
              const addStock = await Stock.findOne({type: args[1]});
              if(!addStock) return e.reply("Please input valid format")

              for (let i = 2; i < args.length; i++) {
                const splitted = args[i].split("\n");
                for (let z = 0; z < splitted.length; z++) {
                  addStock.product.push(splitted[z]);
                }
              }
              addStock.save()
              return e.reply(`sucsessfully added`);

            })();
          } else return e.reply("nope");
          break;

        case "send":
          if(e.author.id === "870927334931316787") {
            async function sendStock() {
              const findProduct  = await Stock.findOne({type: args[2].toUpperCase()})
              const userExist = await User.findOne({userId: args[1].replace(/[<>\ @]/g, "")})
              const splicced = findProduct.product.splice(0, Number(args[3]))

              const user = await client.users.fetch(userExist.userId);

              if(findProduct.length === 0) return e.reply("Stock Sold")
              if(!userExist) return e.reply("User not found!")

              findProduct.save()
              return user.send(String(splicced.join("\n")))
            }
            return sendStock()
          }

        case "help":
          if(args.length > 1) return e.reply({embeds: [commandError]})
          const help = new EmbedBuilder()
              .setTitle(`BOT COMMANDS`)
              .setDescription(
                  `.help\n.set <growId>\n.bal\n.depo\n.info\n.stock\n.buy <CODE> <ammount>] | check CODE at <#${stockChannel}>\n`
              )
              .setColor(0x0099ff)
              .setImage(banner);

          return e.reply({ embeds: [help] });

        case "info":
          if(args.length > 1) return e.reply({ embeds: [productCode] });
          if (!userExist) return e.reply({ embeds: [setError] });
        async function displayUserInformation() {
          const findUser = await User.findOne({ userId: e.author.id });
          const { growID, balance } = findUser;
          try {
            userInformation
                .setTitle(`${e.author.username} Information`)
                .setDescription(
                    `GrowID: ${growID}\nBalance: ${balance} ${emojiWL}`
                );

            return e.reply({ embeds: [userInformation] });
          } catch (err) {
            console.error(err);
          }
        }

          return displayUserInformation();

        case "depo":
          if(args.length > 1) return e.reply({embeds: [commandError]})
          const embed = new EmbedBuilder()
              .setTitle("WORLD: SHOOTINGTEAMREYS\nOWNER: FAYSAVINGSS")
              .setDescription("NO BOT? DONT DONATE!");

          return e.channel.send({ embeds: [embed] });

        case "bal":
          if(args.length > 1) return e.reply({embeds: [commandError]})
          if (!userExist) return e.reply({ embeds: [setError] });
        async function userBalance() {
          const findUserBalance = await User.findOne({ userId: e.author.id });
          try {
            const dataBalance = String(findUserBalance.balance);

            const embed = new EmbedBuilder().setTitle(
                `Balance: ${dataBalance} ${emojiWL}`
            );

            return e.reply({ embeds: [embed] });
          } catch (err) {
            console.log(err);
          }
        }
          return userBalance();

        case `set`:
          if(args.length > 2) return e.reply({embeds: [commandError]})
        async function displayUser() {
          const embed = new EmbedBuilder()
              .setTitle(`Succsessfully`)
              .setDescription(`Set GrowID to: ${args[1]}`)
              .setColor(0x5cff21);

          const findUserGrowID = await User.findOne({
            userId: e.author.id,
          });
          if (args[1] === undefined) return e.reply({ embeds: [productCode] });

          const checkIfOtherUser = await User.find({ growID: args[1] });
          if (!findUserGrowID) {
            console.log("user pertama" + args[1]);
            if (checkIfOtherUser.length === 0) {
              const CreateUser = new User({
                userId: e.author.id,
                growID: args[1],
              });
              console.log("ini" + CreateUser.growID);
              CreateUser.save();
              return e.reply({ embeds: [embed] });
            }
          }
          if (checkIfOtherUser.length > 0)
            return e.reply({ embeds: [nameTaken] });

          if (findUserGrowID.growID !== args[1]) {
            findUserGrowID.growID = args[1];
            findUserGrowID.save();
            return e.reply({ embeds: [embed] });
          }
        }
          return displayUser();

        case "buy":
          if(args.length > 3) return e.reply({embeds: [productCode  ]})
          const isNumber = /^\d+$/.test(args[2]);
          if (!isNumber) return e.reply(`What is ${args[2]}? Please write the right Nominal`)
          if (!userExist) return e.reply({ embeds: [setError] });
          if (args[2] === undefined) return e.reply({ embeds: [productCode] });
          if (parseInt(args[2]) <= 0)
            return e.reply("barang yang dibeli harus > 0")
        async function penjumlahan(jumlah, idUser) {
          const findUser = await User.findOne({ userId: e.author.id });
          if (!findUser) return e.reply({ embeds: [setError] });
          const balanceCheck = findUser.balance;
          const stockCheck = await Stock.findOne({ type: args[1] });
          if (!stockCheck) return e.reply({ embeds: [commandError] });
          if (stockCheck.product.length < jumlah)
            return e.reply("Not enough Stock");
          const hasilAkhir = jumlah * stockCheck.price;
          console.log("hasil akhir" + hasilAkhir);
          if (balanceCheck < hasilAkhir)
            return e.reply({ embeds: [balanceMinus] });
          const final = stockCheck.product.splice(0, jumlah);
          stockCheck.save();
          const user = await client.users.fetch(idUser);; //sending to DM

          await User.findOneAndUpdate(
              { userId: findUser.userId },
              {
                $set: {
                  balance: findUser.balance - hasilAkhir,
                },
              },
              { new: true }
          );

          async function embedProduk(title) {
            const newStock = await Stock.findOne({type: args[1]})
            const dataHistory = {
              buyyer: "<@" + e.author.id + ">",
              product: `${jumlah} ${title}`,
              totalPrice: hasilAkhir,
            };
            const embed = new EmbedBuilder()
                .setTitle(`Pembelian ${title}`)
                .setDescription(
                    `Buyyer: ${dataHistory.buyyer}\nProduct: ${dataHistory.product}\nTotal: ${dataHistory.totalPrice} ${emojiWL}`
                )
                .setImage(banner)
                .setTimestamp()
                .setColor(0x0099ff);

            const newHistory = new History(dataHistory);

            newHistory.save();

            client.channels.cache
                .get("1121664519593275473")
                .send({ embeds: [embed] });

            transcationSendToUser
                .setTitle("Succsessfull Purchase")
                .setDescription(
                    `You have purchased ${args[2]} CID Anti Invalid for ${hasilAkhir} ${emojiWL}\nDon't forget to give reps, Thanks. New Stock: ${newStock.product.length} Left!`)
                .setImage(banner)
                .setColor(0x0099ff)


            await user.send({embeds: [transcationSendToUser]})
            await user.send(String(final))

            return e.reply({ embeds: [succsessTransaction] });
          }
          return embedProduk(stockCheck.type);
        }
          return penjumlahan(Number(args[2]),  e.author.id);
        case "stock":
          const stock = await Stock.find();
          const listProduct = new EmbedBuilder()
              .setColor(0xa2ff86)
              .setTitle("STOCK PRODUCT")
              .setFields(
                  {
                    name: "\n",
                    value: `Code: **${stock[0].type}**\nStock: ${
                        stock[0].product.length
                    } ${
                        stock[0].product.length === 0 ? ":x:" : ":white_check_mark:"
                    }\nPrice: ${stock[0].price} ${emojiWL}`,
                    inline: true,
                  },
                  {
                    name: "\n",
                    value: `Code: **${stock[1].type}**\nStock: ${
                        stock[1].product.length
                    } ${
                        stock[1].product.length === 0 ? ":x:" : ":white_check_mark:"
                    }\nPrice: ${stock[1].price} ${emojiWL}`,
                    inline: true,
                  },
                  {
                    name: "\n",
                    value: `Code: **${stock[2].type}**\nStock: ${
                        stock[2].product.length
                    } ${
                        stock[2].product.length === 0 ? ":x:" : ":white_check_mark:"
                    }\nPrice: ${stock[2].price} ${emojiWL}`,
                    inline: false,
                  }
              )
              .setFooter({ text: "Requested by" + " " + e.author.username })
              .setTimestamp();
          return e.channel.send({ embeds: [listProduct] });

        default:
          commandError
              .setDescription(`.${args[0]} Is not right Command, type **.help** for see  Command`)
          return e.reply({embeds: [commandError]});
      }
    }
  }
  return command()
})

client.login(
  "MTExODEzNzc5ODg4MTQ1MjAzMg.GVdiaA.8wDVTsPDC6sHqALsT8xmpcs6TIsxLvxAAmN7X0"
);
