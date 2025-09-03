import { LX } from 'lexgui';
import 'lexgui/extensions/codeeditor.js';
import 'lexgui/extensions/timeline.js';
import 'lexgui/extensions/audio.js';

window.LX = LX;

function requestFile( url, dataType, nocache ) {
    return new Promise( (resolve, reject) => {
        dataType = dataType ?? "arraybuffer";
        const mimeType = dataType === "arraybuffer" ? "application/octet-stream" : undefined;
        var xhr = new XMLHttpRequest();
        xhr.open( 'GET', url, true );
        xhr.responseType = dataType;
        if( mimeType )
            xhr.overrideMimeType( mimeType );
        if( nocache )
            xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.onload = function(load)
        {
            var response = this.response;
            if( this.status != 200)
            {
                var err = "Error " + this.status;
                reject(err);
                return;
            }
            resolve( response );
        };
        xhr.onerror = function(err) {
            reject(err);
        };
        xhr.send();
        return xhr;
    });
};

const area = await LX.init( { layoutMode: "document", rootClass: "wrapper" } );
const starterTheme = LX.getTheme();
const projects = JSON.parse( await requestFile( "projects.json", "text" ) );

// Menubar
{
    const menubar = area.addMenubar( [] );

    LX.addSignal( "@on_new_color_scheme", ( el, value ) => {
        // 
    } );

    menubar.addButtons( [
        {
            title: "Switch Theme",
            icon: starterTheme == "dark" ? "Moon" : "Sun",
            swap: starterTheme == "dark" ? "Sun" : "Moon",
            callback:  (value, event) => { LX.switchTheme() }
        },
        {
            title: "Switch Spacing",
            icon: "AlignVerticalSpaceAround",
            callback:  (value, event) => { LX.switchSpacing() }
        }
    ], { float: "center" });
}

// Header
{
    const header = LX.makeContainer( [ null, "auto" ], "header-area flex flex-row border-top border-bottom", "", area );

    const headerLeft = LX.makeContainer( [ null, "auto" ], "flex flex-col gap-2 px-10 py-8", `
        <p class="fg-secondary" style="max-width:32rem">Software developer.</p>
        <h1 class="">Alex Rodríguez</h1>
        <p class="leading-normal fg-secondary" style="max-width:48rem"> +8 years as a research and development engineer at Pompeu Fabra
        University, teaching roles in Computer Graphics and Game Development. Passionate about both coding and
        playing games. I'm eager to bring my skills to new challenges in software development, interactive applications,
        or computer graphics.</p>
    `, header );

    const headerRight = LX.makeContainer( [ null, "auto" ], "contact-rect flex flex-col gap-2 px-10 py-8 justify-end items-end", `
    <p class="fg-primary text-end">
    alexroco.30@gmail.com<br>
    +34 634707943<br>
    08150, Barcelona<br>
    </p>
    <p class="text-md text-end">
    <span class="fg-tertiary">Other links:</span><br>
    <a class="fg-secondary decoration-none hover:text-underline" href="https://github.com/jxarco/">github.com/jxarco</a><br>
    <a class="fg-secondary decoration-none hover:text-underline" href="https://jxarco.itch.io/">jxarco.itch.io</a><br>
    <a class="fg-secondary decoration-none hover:text-underline" href="https://www.linkedin.com/in/alejandro-roco/">linkedin.com/alejandro-roco</a><br>
    <a class="fg-secondary decoration-none hover:text-underline" href="https://www.youtube.com/watch?v=FcAQGF1KXts">youtube.com/coding-reel</a><br>
    </p>`, header );
}

// Content
{
    
    LX.makeContainer( [ "auto", "auto" ], "fg-primary px-8 pt-4 font-bold font-code text-xl", "Projects", area );

    const tabs = area.addTabs( { parentClass: "p-4", sizes: [ "auto", "auto" ], contentClass: "p-6 pt-0" } );

    const listProjects = ( type, container ) => {

        const listContainer = LX.makeContainer( ["100%", "auto"], "grid project-list gap-4 p-4 justify-center", "", container );

        for( const project of projects ?? [] )
        {
            if( project.type !== type )
            {
                continue;
            }

            const projectItem = LX.makeElement( "li", "relative project-item rounded-lg bg-secondary hover:bg-tertiary cursor-pointer overflow-hidden flex flex-col h-auto", "", listContainer );

            const projectPreview = LX.makeElement( "img", "rounded-t-lg bg-secondary hover:bg-tertiary w-full border-none", "", projectItem );
            projectPreview.src = project.preview ? `previews/${ project.preview }.png` : "previews/project_preview.png";

            if( project.video )
            {
                const projectVideo = LX.makeElement( "video", "absolute rounded-t-lg w-full border-none pointer-events-none", "", projectItem );
                projectVideo.setAttribute( "disablePictureInPicture", false );
                projectVideo.setAttribute( "disableRemotePlayback", false );
                projectVideo.setAttribute( "loop", true );
                projectVideo.setAttribute( "async", true );
                projectVideo.style.transition = "opacity 0.2s ease-out";
                projectVideo.style.opacity = "0";
                projectVideo.src = project.video;
                projectVideo.volume = project.videoVolume ?? 0.4;
            }
            else if( project.iVideo )
            {
                const projectVideo = LX.makeElement( "iframe", "absolute rounded-t-lg w-full h-full border-none", "", projectItem );
                projectVideo.src = project.iVideo;
                projectVideo.setAttribute( "allow", "" );
                projectVideo.style.transition = "opacity 0.2s ease-out";
                projectVideo.style.opacity = "0";
            }

            const projectDesc = LX.makeContainer( ["100%", "100%"], "flex flex-row rounded-b-lg gap-6 p-4 items-center", `
                <div class="flex flex-col gap-1 w-full">
                    <div class="flex flex-row items-center">
                        <div class="text-lg font-bold"><span>${ project.name }</span></div>
                        <div class="text-sm font-light fg-secondary text-end ml-auto"><span>${ project.year ?? "" }</div>
                    </div>
                    <div class="text-md font-light fg-secondary"><span class="xline-clamp-1">${ project.description ?? "" }</div>
                </div>`, projectItem );

            if( project.content )
            {
                switch( project.content?.type )
                {
                    case "badge":
                        const b = LX.badge( project.content?.html ?? "", "contrast border absolute top-0 right-0 m-2", { asElement: true } );
                        projectItem.appendChild( b );
                        break;
                }
            }

            projectItem.addEventListener( "click", ( e ) => {
                console.log(e)
                if( project.url ) window.open( project.url, "_blank" );
            } );

            projectItem.addEventListener( "mouseenter", ( e ) => {
                if( !project.video && !project.iVideo ) return;
                e.preventDefault();
                const video = projectItem.querySelector( "video" ) ?? projectItem.querySelector( "iframe" );
                video.style.opacity = "1";
                if( project.video ) video.play();
            } );

            projectItem.addEventListener( "mouseleave", ( e ) => {
                if( !project.video && !project.iVideo ) return;
                e.preventDefault();
                const video = projectItem.querySelector( "video" ) ?? projectItem.querySelector( "iframe" );
                video.style.opacity = "0";
                if( project.video ) video.pause();
                else video.src = project.iVideo;
            } );
        }
    }

    {
        const graphicsProjects = LX.makeContainer( [ null, "auto" ], "flex flex-col bg-primary border rounded-lg overflow-scroll" );
        tabs.add( "Graphics", graphicsProjects, { selected: true } );
        listProjects( "graphics", graphicsProjects );
    }

    {
        const gameProjects = LX.makeContainer( [ null, "auto" ], "flex flex-col bg-primary border rounded-lg overflow-scroll" );
        tabs.add( "Games", gameProjects, { xselected: true } );
        listProjects( "game", gameProjects );
    }

    {
        const webProjects = LX.makeContainer( [ "auto", "auto" ], "flex flex-col bg-primary border rounded-lg overflow-scroll" );
        tabs.add( "Web", webProjects, { xselected: true } );
        listProjects( "web", webProjects );
    }
}

// Footer
{
    const footer = new LX.Footer( {
        className: "border-top",
        parent: LX.root,
        xcolumns: [
            {
                title: "LexGUI",
                items: [
                    { title: "Source code on Github", link: "https://github.com/jxarco/lexgui.js/" }
                ]
            },
            {
                title: "Projects",
                items: [
                    { title: "Animics", link: "https://animics.gti.upf.edu/" },
                    { title: "Performs", link: "https://performs.gti.upf.edu/" }
                ]
            },
            {
                title: "References",
                items: [
                    { title: "shadcn/ui", link: "https://ui.shadcn.com/" },
                    { title: "Radix UI", link: "https://www.radix-ui.com/" },
                ]
            }
        ],
        credits: `${ new Date().getUTCFullYear() } Alex Rodríguez. Website source code on GitHub.`,
        socials: [
            { title: "Github", link: "https://github.com/jxarco", icon: "Github@solid" },
            { title: "LinkedIn", link: "https://www.linkedin.com/in/alejandro-roco/", icon: "Linkedin@solid" }
        ]
    } );
}