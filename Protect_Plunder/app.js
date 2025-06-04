class Oyuncu {
            constructor(game){
                this.game = game; // Oyuncu sınıfının game özelliği, oyunun ana game nesnesine erişmek için kullanılır.
                this.x = this.game.width * 0.5;
                this.y = this.game.height * 0.5;
                this.cvr = 40; // Oyuncunun daire şeklindeki alanının yarıçapı, çarpışma algılama için kullanılır.
                this.image = document.getElementById('oyuncu');
                this.aim;
                this.angle = 0;
            }
            draw(context){
                context.save();
                context.translate(this.x, this.y); // Oyuncunun çizileceği konumu ayarla.
                context.rotate(this.angle); // Oyuncunun dönme açısını ayarla.
                context.drawImage(this.image, -this.cvr, -this.cvr);
                if (this.game.debug) { // Debug modunda ise:
                    context.beginPath(); // Yeni bir yol başlat.
                    context.arc(0, 0, this.cvr, 0, Math.PI * 2); // Oyuncunun çarpışma alanını çiz.
                    context.stroke(); // Yolu çiz.
                    context.restore(); // Canvas'in önceki durumuna geri dön.
                }
                context.restore();
            }
            update(){
                // Oyuncunun güncellenmiş konumu ve nişan açısı hesaplanır.
                this.aim = this.game.calcAim(this.game.ganimet, this.game.mouse);
                this.x = this.game.ganimet.x + (this.game.ganimet.cvr + this.cvr) * this.aim[0];
                this.y = this.game.ganimet.y + (this.game.ganimet.cvr + this.cvr) * this.aim[1];
                this.angle = Math.atan2(this.aim[3], this.aim[2]);
            }
            shoot() {
                // Oyuncunun ateş etmesini sağlar.
                const kursun = this.game.kursunAl();
                if (kursun) kursun.start(this.x + this.cvr * this.aim[0], this.y + this.cvr * this.aim[1], this.aim[0], this.aim[1]);
                console.log(kursun);
            }
        }



class ganimet {
    constructor(game){
        this.game = game;
        this.x = this.game.width * 0.5;
        this.y = this.game.height * 0.5;
        this.cvr = 80;
        this.image = document.getElementById('ganimet');
    }
    draw(context){
        context.drawImage(this.image, this.x - 80, this.y - 80);
        if (this.game.debug) {
            context.beginPath();
            context.arc(this.x, this.y, this.cvr, 0, Math.PI * 2);
            context.stroke();
        }
        
    }
}

class Kursun {
    constructor(game){
        this.game = game;
        this.x;
        this.y;
        this.cvr = 5;
        this.speedX = 1;
        this.speedY = 1;
        this.hizDegistirici = 3; // Kursunun hızını artırmak için kullanılan bir faktör.
        this.free = true; // Kursunun serbest olup olmadığını belirtir, başlangıçta serbesttir.
    }
    start(x, y, speedX, speedY){
        this.free = false; // Kursun artık serbest değil, yani hareket etmeye başlayacak.
        this.x = x;
        this.y = y;
        this.speedX = speedX * this.hizDegistirici;
        this.speedY = speedY * this.hizDegistirici;
    }
    reset(){
        this.free = true; // Kursun serbest bırakılır, yani tekrar kullanıma hazır hale getirilir.
    }
    draw(context){
        if(!this.free){ // Eğer kursun serbest değilse yeni bir yol başlat çizim durumunu geri yükle.
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, this.cvr, 0, Math.PI * 2);
            context.fillStyle = '#9A0296';
            context.fill();
            context.restore();
        }
    }
    update(){
        if(!this.free){ // Eğer kursun serbest değilse x ve y konumlarını güncelle
            this.x += this.speedX;
            this.y += this.speedY;
        }
        if (this.x < 0 || this.x > this.game.width || this.y < 0 || this.y > this.game.height) {
            this.reset();  // Eğer kursun oyun alanının dışına çıkarsa kursunu sıfırla, yani tekrar kullanıma hazır hale getir.
        }
    }
}

class dusman {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0
        this.cvr = 20;
        this.width = this.cvr * 2;
        this.height = this.cvr * 2;
        this.speedX = 0;
        this.speedY = 0;
        this.hizDegistirici = Math.random() * 0.7 + 0.1;
        this.angle = 0; // Düşmanın dönme açısı, hareket yönünü belirlemek için kullanılır.
        this.carpisma = 0; // Düşmanın çarpışma durumu, başlangıçta 0'dır.
        this.free = true;
    }
    start() {
        // Düşmanı başlatmak için kullanılan yöntem.
        this.free = false;
        this.carpisma = false; // Düşmanın çarpışma durumu sıfırlanır.
        this.frameX = 0.25;
        this.can = this.maxCan; // Düşmanın canı, maksimum can değeriyle başlatılır.
        this.frameY = 0.25;
        if (Math.random() < 0.5){
             // Rastgele bir sayı seçilir düşmanın x konumu rastgele genişlikte belirlenir, eğer rastgele seçilen bir sayı 0.5'ten küçükse yükseklikte belirlenir, aksi takdirde yükseklik dışında belirlenir.
            this.x = Math.random() * this.game.width;
            this.y = Math.random() < 0.5 ? -this.cvr : this.game.height + this.cvr;
        } else {
             // Diğer durumda düşmanın x konumu eğer rastgele seçilen bir sayı 0.5'ten küçükse genişlikte belirlenir,y konumu rastgele yükseklikte belirlenir.
            this.x = Math.random() < 0.5 ? -this.cvr : this.game.width + this.cvr;
            this.y = Math.random() * this.game.height;
        }
        const aim = this.game.calcAim(this, this.game.ganimet);
        this.speedX = aim[0] * this.hizDegistirici;
        this.speedY = aim[1] * this.hizDegistirici;
        this.angle = Math.atan2(aim[3], aim[2]) + Math.PI * 0.5; // Düşmanın hareket yönü belirlenir.
    }
    reset() {
        this.free = true; // Düşman serbest bırakılır, yani tekrar kullanıma hazır hale getirilir.
    }
    hit(hasar) {
        // Düşmanın vurulduğunda canını azaltmak için kullanılır.
        this.can -= hasar;
        if (this.can >= 1) this.frameX++;
    }
    draw(context) {
        // Düşmanın çizimini yapmak için kullanılan yöntem.
        if (!this.free) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.width , this.frameY * this.height, this.width, this.height, -this.cvr, -this.cvr, this.width, this.height);
            if (this.game.debug){
                context.beginPath();
                context.arc(0, 0, this.cvr, 0, Math.PI *2);
                context.stroke();
                context.fillText(this.can, 0, 0);
            }
            context.restore();
        }
    }
    update() {
        // Düşmanın güncellenmesi için kullanılan yöntem.
        if (!this.free){
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.game.carpmaKontrol(this, this.game.ganimet) && this.can >= 1){
                 // Eğer düşman, hedefle çarpışırsa ve canı 1'den büyükse düşmanın canını , hızını sıfırla.
                this.can = 0;
                this.speedX = 0;
                this.speedY = 0;
                this.carpisma = true;// Düşmanın çarpışma durumunu belirle.
                this.game.can--; // Oyunun canını azalt.
            }
            if (this.game.carpmaKontrol(this, this.game.oyuncu) && this.can >= 1){
                 // Eğer düşman, oyuncu ile çarpışırsa ve canı 1'den büyükse düşmanın canını sıfırla.
                this.can = 0;
                this.carpisma = true; // Düşmanın çarpışma durumunu belirle.
                this.game.can--; // Oyunun canını azalt.
            }
            this.game.kursunpool.forEach(kursun => {
                if (!kursun.free && this.game.carpmaKontrol(this, kursun) && this.can >= 1){
                    // Eğer kursun serbest değilse ve düşmanla çarpışırsa ve düşmanın canı 1'den büyükse
                    kursun.reset(); // Kursunu sıfırla.
                    this.hit(1); // Düşmanı vur.
                }
            });
            if (this.can < 1 && this.game.spriteUpdate) {
                this.frameX++; // Animasyon çerçevesini ilerlet.

            }
            if (this.frameX > this.maxFrame) {
                // Eğer animasyon çerçevesi maksimum çerçeveden büyükse düşmanı sıfırla.
                this.reset();
                if (!this.carpisma && !this.game.gameOver) this.game.score += this.maxCan; // Eğer çarpışma olmadıysa ve oyun sonu değilse, puanı artır.
            }

        }
    }    
}

class bat extends dusman {
    //Bat düşmanının değerleri tanımlanmıştır.
    constructor(game) {
        super(game); // Üst sınıfın (dusman) constructor'ını çağırır ve game parametresini ileterek miras alır.
        this.image = document.getElementById('bat');
        this.frameX = 0.25;
        this.frameY = 0.25;
        this.maxFrame = 7;
        this.can = 4;
        this.maxCan = this.can;
    }
}

class rat extends dusman {
    //Rat düşmanının değerleri tanımlanmıştır.
    constructor(game) {
        super(game);
        this.image = document.getElementById('rat');
        this.frameX = 0.55;
        this.frameY = 0.55;
        this.maxFrame = 4;
        this.can = 2;
        this.maxCan = this.can;
    }
}

class Game {
    constructor(canvas){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ganimet = new ganimet(this);
        this.oyuncu = new Oyuncu(this);
        this.debug = false;

        this.kursunpool = [];// Kursun havuzu, tekrar kullanılabilir kursun nesnelerini içerir.
        this.kursunsayisi = 15;
        this.createKursunPool(); // Kursun havuzunu oluşturan fonksiyonu çağırır.

        this.dusmanpool = []; // Düşman havuzu, tekrar kullanılabilir düşman nesnelerini içerir.
        this.dusmansayisi = 10; // Başlangıçta oluşturulacak düşman sayısı.
        this.createDusmanPool(); // Düşman havuzunu oluşturan fonksiyonu çağırır.
        this.dusmanpool[0].start(); // İlk düşmanı başlatır.
        this.dusmanZamanlayici = 0; // Düşman oluşturma zamanlayıcısı, düşmanların aralıklı olarak oluşturulmasını sağlar.
        this.dusmanZamanlayiciInterval = 800; // Düşman oluşturma zamanlayıcısı aralığı.

        this.spriteUpdate = false; // Sprite güncelleme durumu, animasyon çerçevelerini kontrol eder.
        this.spriteTimer = 0; // Sprite güncelleme zamanlayıcısı, animasyon çerçevelerini günceller.
        this.spriteInterval = 150; // Sprite güncelleme aralığı.
        this.score = 0; // Oyuncunun skoru.
        this.kazanmaSkoru = 100; // Oyunu kazanmak için gereken skor.
        this.can = 3; // Oyuncunun can sayısı.

        this.mouse = {
            x: 0,
            y: 0
        }

        window.addEventListener('mousemove' , e => { // Fare hareketi algılandığında fare konumunu günceller.
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
        });
        window.addEventListener('mousedown' , e => { // Fare tıklaması algılandığında ateş etme işlemini gerçekleştirir.
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
            this.oyuncu.shoot(); // Oyuncunun ateş etme fonksiyonunu çağırır.
            console.log(this.mouse.x, this.mouse.y);
        })
        window.addEventListener('keyup' , (e) => { // Klavye tuş atamaları.
            if (e.key === 'd') this.debug =! this.debug; // 'd' tuşuna basıldığında debug modunu açar veya kapatır.
            else if (e.key === 'q') this.oyuncu.shoot(); // 'q' tuşuna basıldığında oyuncunun ateş etme fonksiyonunu çağırır.
        });
    }
    render(context, deltaTime){
        //Ganimet, oyuncu, kursunlar ve düşmanlar çizilir ve güncellenir
        this.ganimet.draw(context);
        this.gosterDurum(context); // Oyun durumu gösterimi (Opsiyonel, metin veya ekran üzerinde durum gösterimi)
        this.oyuncu.draw(context);
        this.oyuncu.update(); // Oyuncunun güncellenmesi (pozisyon vb.)
        this.kursunpool.forEach(kursun => {
            kursun.draw(context);   
            kursun.update(); 
        });
        this.dusmanpool.forEach(dusman => {
            dusman.draw(context);
            dusman.update();
        });
        //periyodik olarak aktif düşman gönderme
        if (!this.gameOver){
            if (this.dusmanZamanlayici < this.dusmanZamanlayiciInterval){
                this.dusmanZamanlayici += deltaTime;
            } else {
                this.dusmanZamanlayici = 0;
                const dusman = this.dusmanAl();
                if (dusman) dusman.start();
            }
            if (this.spriteTimer < this.spriteInterval){
            this.spriteTimer += deltaTime;
            this.spriteUpdate = false;
        } else {
            this.spriteTimer = 0;
            this.spriteUpdate = true;
        }
        // Oyun sonu koşulları kontrol edilir ve oyun bitirilir.
        if (this.score >= this.kazanmaSkoru || this.can < 1){
            this.gameOver = true;
        }
        
        }
        
    }
    // Oyun sonunda skor ve durum mesajlarının yazdırılmasını sağlar.
    gosterDurum(context){
        context.save();
        context.textAlign = 'left';
        context.font = '30px Impact';
        context.fillText('Score: ' + this.score, 20, 30);
        for (let i = 0; i < this.can; i++) {
            context.fillRect(20 + 15 * i, 60, 10, 30);
        }
        if (this.gameOver){
            context.textAlign = 'center';
            let message1;
            let message2;
            let message3;
            if (this.score >= this.kazanmaSkoru){
                message1 = 'Kazandın!';
                message2 = 'Skor: ' + this.score + '!';
                message3 = 'Tekrar Oynamak için sayfayı yenile';
            } else {
                message1 = 'Kaybettin!';
                message2 = 'Ganimeti Korumayı Başaramadın!';
                message3 = 'Skor: ' + this.score;
            }
            context.font = '100px Impact';
            context.fillText(message1, this.width * 0.5, 200);
            context.font = '50px Impact';
            context.fillText(message2, this.width * 0.5, 550);
            context.font = '35px Impact';
            context.fillText(message3, this.width * 0.5, 600);
        }
        context.restore();
    }
    calcAim(a,b){
        // A noktasının x ve y koordinatları ile B noktasının x ve y koordinatları arasındaki farklar hesaplanır
        const mx = a.x - b.x;
        const my = a.y - b.y;
        const distance = Math.hypot(mx, my);
        const aimX = mx / distance * -1;
        const aimY = my / distance * -1;
         // Hesaplanan hedef yönü ve A ve B noktaları arasındaki farklar dizide saklanır ve döndürülür
        return [aimX, aimY, mx, my]; // Hedefin x ve y yönleri, A ve B noktaları arasındaki farklar dizide döndürülür
    }
    carpmaKontrol(a, b){
        //nesneler arasındaki teması kontrol etmek için
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        return distance < a.cvr + b.cvr;
    }
    createKursunPool(){
        //Sürekli olarak yeni kursun nesneleri oluşturmak yerine, havuzda bulunan hazır kursun nesneleri kullanılır ve gerektiğinde yeniden kullanılmak üzere havuza geri yerleştirilir. 
        for (let i = 0; i < this.kursunsayisi; i++) {
            this.kursunpool.push(new Kursun(this));
        }
    }
    kursunAl(){
        for (let i = 0; i < this.kursunpool.length; i++){
            if(this.kursunpool[i].free){
                return this.kursunpool[i];
            }
        }
    }
    createDusmanPool(){
        // Belirlenen düşman sayısı kadar döngü oluşturulur
        for (let i = 0; i < this.dusmansayisi; i++) {
            // Her döngü adımında, rastgele bir sayı oluşturulur
            let rastgeleSayi = Math.random(); // Oluşturulan rastgele sayıya bağlı olarak, farklı düşman türlerinden biri oluşturulur
            if (rastgeleSayi > 0.25){
                this.dusmanpool.push(new bat(this)); // Eğer rastgele sayı 0.25'ten büyükse, bir yarasa (bat) nesnesi oluşturulur
            } else {
                // this.dusmanpool.push(new rat(this));
            }
            
        }
    }
    dusmanAl(){
         // Düşman havuzundaki tüm düşmanları kontrol etmek için döngü oluşturulur
        for (let i = 0; i < this.dusmanpool.length; i++){
            if(this.dusmanpool[i].free){
                 // Eğer bir düşman serbestse (free), yani kullanılabilir durumdaysa serbest düşmanı döndür ve bu düşmanın kullanılabilirliğini değiştir
                return this.dusmanpool[i];
            }
        }
    }
}

window.addEventListener('load',function(){
            const canvas = document.getElementById('mycanvas');
            const ctx = canvas.getContext('2d');
            const startButton = document.getElementById('startButton'); // Butonu seç
            canvas.width = 800;
            canvas.height = 800;
            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'white';
            ctx.lineWidth = 2;
            ctx.font = '50px Helvetica';
            ctx.textAlign = 'center';
            ctx.textBaseline ='middle';
            let game; // Oyun değişkenini tanımla

            // Oyunu başlatmak için bir işlev oluştur
            function startGame() {
                game = new Game(canvas); // Oyunu başlat
                let sonTime = 0;
                function animate(timeMuhur){
                    const deltaTime = timeMuhur - sonTime;
                    sonTime = timeMuhur;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    game.render(ctx, deltaTime);
                    requestAnimationFrame(animate);
                }
                requestAnimationFrame(animate);
                document.getElementById('gameInstructions').style.display = 'none'; // Oyun başladığında talimatları gizle
            }

            // Butona tıklanınca oyunu başlat
            startButton.addEventListener('click', function() {
                startGame();
                startButton.style.display = 'none'; // Butonu gizle
            });

            // Oyun sayfası yüklendiğinde talimatları göster
            document.addEventListener('DOMContentLoaded', function() {
                document.getElementById('gameInstructions').style.display = 'block';
            });
        });
