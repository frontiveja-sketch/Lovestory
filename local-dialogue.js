// GitHub Pages だけで動くローカル会話エンジン。
(() => {
  function useBundledSprite(img) {
    const src = img.getAttribute('src') || '';
    const match = src.match(/^assets\/(konuko|shanko|deko)_(?:normal|happy|shy|sad)\.png$/);
    if (match) img.setAttribute('src', match[1] + '_normal.png');
  }

  document.querySelectorAll('img[src^="assets/"]').forEach(useBundledSprite);
  new MutationObserver(records => {
    records.forEach(record => useBundledSprite(record.target));
  }).observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ['src'],
  });

  const replies = {
    konuko: [
      ['えっ、一緒に…？ う、うれしいです。ぜひお願いします…！', 'その本、気になりますよね。少しだけならお話できます…', 'あの…緊張しますけど、声をかけてくれてありがとうございます。'],
      ['その作品、私も大好きです！ 推しの話、してもいいですか？', '聞いてくれるんですか？ じゃあ、少しだけ語りますね…', 'うん…静かに聞いてくれるのも、なんだか落ち着きます。'],
      ['また話したいです。次はもっと上手に話せる気がします…！', '私も楽しかったです。こんなに話せたの、久しぶりかも。', 'その笑顔、優しいですね…。少し安心しました。'],
      ['今度、一緒に本屋へ行きたいです。おすすめを選びたいな…', 'グッズを見ると話が止まらなくて…引かないでくださいね？', 'ずっと聞いてくれて、ありがとうございます。うれしいです。'],
      ['明日も会えたら、今度こそ私から声をかけます…！', '好きな作品、次に会うまでにまとめておきますね。', 'さよならは寂しいけど…また会えますよね？'],
    ],
    shanko: [
      ['やったー！ そのノリ最高！ 今日はいっぱい話そうね！', '聞いてくれるの？ じゃあ遠慮なくいっちゃうよー！', 'ご、ごめん、最初から飛ばしすぎた！ でも会えてうれしい！'],
      ['ハイタッチ！ なんか私たち、すっごく気が合うね！', 'でしょでしょ！ 一緒に喜んでくれると百倍うれしい！', 'あはは、ちょっと圧が強かった？ 少しだけ落ち着くね！'],
      ['次も絶対おもしろいことしよう！ 約束だからね！', '一緒に笑うと元気が増えるね。まだまだいけるよ！', '付き合ってくれてありがと！ 無理はしなくていいからね。'],
      ['一緒に歌うの！？ いいね、全力でいこー！', 'もっと話す！ 今日はまだ終わらせたくないもん！', '落ち着くのも大事かぁ。じゃあ隣でゆっくり話そ！'],
      ['またすぐ会おう！ 次の予定、今決めちゃおうよ！', '私もめちゃくちゃ楽しかった！ 忘れないからね！', 'またねー！ 次はもっと近くで話してくれたらうれしいな！'],
    ],
    deko: [
      ['あ、ちゃんと見てるよ！ なんだかあなた、気になるかも！', '一緒に見てくれるの？ じゃあ次はあっちも見よう！', '名前、今度こそ覚える！ たぶん…いや、絶対！'],
      ['探検みたいで楽しいね！ あなたとなら迷っても平気！', 'これね、さっき見つけたの！ でも次は…あ、聞いてる？', 'ちゃんとついてきてくれてた！ ありがとう、うれしい！'],
      ['ノリがいいね！ 次はあっち！ その次は…まだ秘密！', '話が飛んでも分かってくれるの、すごく助かる！', '黙っていても隣にいるって分かるよ。なんか安心するね。'],
      ['一緒に迷子になるの楽しそう！ 二人なら冒険だよね！', '私のペースでいいの？ じゃあ手、離さないでね！', '深呼吸したら少し落ち着いた！ あなたって不思議だね。'],
      ['また見つけたら一番に教える！ だからまた会おうね！', '忙しかったけど楽しかった！ 次も一緒に走り回ろう！', 'またね！ 次に会ったら、ちゃんと名前を呼ぶから！'],
    ],
  };
  function toneIndex(message = '') {
    const warmWords = ['一緒', '好き', '聞かせ', '誘う', 'また', '楽しかった', 'すごい', 'ハイタッチ', '合わせ', '教えて'];
    const quietWords = ['黙って', '苦笑', '相づち', '静か', 'ついていく', 'だけ'];
    if (warmWords.some(word => message.includes(word))) return 0;
    if (quietWords.some(word => message.includes(word))) return 2;
    return 1;
  }
  window.getLocalDialogueReply = function getLocalDialogueReply({
    charKey = 'konuko',
    turn = 0,
    choiceText = '',
  } = {}) {
    const key = replies[charKey] ? charKey : 'konuko';
    const lastTurn = replies[key].length - 1;
    const safeTurn = Math.min(Math.max(Number(turn) || 0, 0), lastTurn);
    return replies[key][safeTurn][toneIndex(String(choiceText))];
  };
})();
